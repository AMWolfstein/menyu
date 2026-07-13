import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
  type UpdateData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MenuCategory, MenuItem, Restaurant } from "@/types/menu";

export type FirestoreCategory = Pick<MenuCategory, "id" | "name" | "icon"> & {
  order: number;
};

export type FirestoreItem = Omit<MenuItem, "id"> & {
  id: string;
  categoryId: string;
  order: number;
};

const settingsCol = collection(db, "settings");
const categoriesCol = collection(db, "categories");
const itemsCol = collection(db, "items");

// ---------- قراءة حية (real-time) ----------

export function subscribeRestaurant(
  cb: (restaurant: Restaurant | null) => void
): Unsubscribe {
  return onSnapshot(doc(settingsCol, "restaurant"), (snap) => {
    cb(snap.exists() ? (snap.data() as Restaurant) : null);
  });
}

export function subscribeCategories(
  cb: (categories: FirestoreCategory[]) => void
): Unsubscribe {
  return onSnapshot(categoriesCol, (snap) => {
    cb(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreCategory, "id">) }))
    );
  });
}

export function subscribeItems(
  cb: (items: FirestoreItem[]) => void
): Unsubscribe {
  return onSnapshot(itemsCol, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreItem, "id">) })));
  });
}

// ---------- كتابة ----------

export function updateRestaurant(data: Partial<Restaurant>): Promise<void> {
  return setDoc(doc(settingsCol, "restaurant"), data, { merge: true });
}

export function addCategory(data: {
  name: string;
  icon: string;
  order: number;
}): Promise<void> {
  const id = data.name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40) || crypto.randomUUID();
  return setDoc(doc(categoriesCol, id), data);
}

export function updateCategory(
  id: string,
  data: Partial<{ name: string; icon: string; order: number }>
): Promise<void> {
  return updateDoc(doc(categoriesCol, id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  const itemsInCategory = await getDocs(query(itemsCol, where("categoryId", "==", id)));
  const batch = writeBatch(db);
  itemsInCategory.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(categoriesCol, id));
  await batch.commit();
}

export function addItem(data: {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  badge?: MenuItem["badge"];
  available?: boolean;
  imageUrl?: string;
  order: number;
}): Promise<void> {
  const id = data.name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40) || crypto.randomUUID();
  return setDoc(doc(itemsCol, id), data);
}

export function updateItem(
  id: string,
  data: UpdateData<Omit<FirestoreItem, "id">>
): Promise<void> {
  return updateDoc(doc(itemsCol, id), data);
}

export function deleteItem(id: string): Promise<void> {
  return deleteDoc(doc(itemsCol, id));
}

// ---------- تعبئة أولية (seed) ----------

export async function seedInitialData(seed: {
  restaurant: Restaurant;
  categories: MenuCategory[];
}): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(settingsCol, "restaurant"), seed.restaurant);
  seed.categories.forEach((category, categoryIndex) => {
    const { id: categoryId, items, ...categoryFields } = category;
    batch.set(doc(categoriesCol, categoryId), {
      ...categoryFields,
      order: categoryIndex,
    });
    items.forEach((item, itemIndex) => {
      const { id: itemId, ...itemFields } = item;
      batch.set(doc(itemsCol, itemId), {
        ...itemFields,
        categoryId,
        order: itemIndex,
      });
    });
  });
  await batch.commit();
}
