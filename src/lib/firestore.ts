import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
  type Unsubscribe,
  type UpdateData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  HeroImage,
  MenuCategory,
  MenuItem,
  PosterLink,
  Restaurant,
  SimpleListItem,
} from "@/types/menu";
import type { Order } from "@/types/order";
import type { BackupConfig } from "@/types/backup";

export type FirestoreCategory = Pick<MenuCategory, "id" | "name" | "icon"> & {
  order: number;
};

export type FirestoreItem = Omit<MenuItem, "id"> & {
  id: string;
  categoryId: string;
  order: number;
  createdAt?: Timestamp;
  discountEndsAt?: Timestamp;
};

const settingsCol = collection(db, "settings");
const categoriesCol = collection(db, "categories");
const itemsCol = collection(db, "items");

// ---------- قوائم بسيطة (فروع / مناطق توصيل / طرق دفع) ----------
// نفس شكل CRUD الفئات بالظبط (اسم + ترتيب)، معمّم مرة واحدة بدل تكراره 3 مرات.

function makeSimpleListApi(collectionName: string) {
  const col = collection(db, collectionName);
  return {
    subscribe(cb: (items: SimpleListItem[]) => void): Unsubscribe {
      return onSnapshot(col, (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SimpleListItem, "id">),
        }));
        cb(items.sort((a, b) => a.order - b.order));
      });
    },
    add(name: string, order: number): Promise<void> {
      const id =
        name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40) || crypto.randomUUID();
      return setDoc(doc(col, id), { name, order });
    },
    update(id: string, name: string): Promise<void> {
      return updateDoc(doc(col, id), { name });
    },
    remove(id: string): Promise<void> {
      return deleteDoc(doc(col, id));
    },
  };
}

export const branchesApi = makeSimpleListApi("branches");
export const deliveryZonesApi = makeSimpleListApi("deliveryZones");
export const paymentMethodsApi = makeSimpleListApi("paymentMethods");
export const suppliersApi = makeSimpleListApi("suppliers");

// ---------- روابط تذييل صور المشاركة (poster links) ----------

const posterLinksCol = collection(db, "posterLinks");

export function subscribePosterLinks(cb: (links: PosterLink[]) => void): Unsubscribe {
  return onSnapshot(posterLinksCol, (snap) => {
    const links = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PosterLink, "id">) }));
    cb(links.sort((a, b) => a.order - b.order));
  });
}

export function addPosterLink(data: {
  platform: PosterLink["platform"];
  label: string;
  order: number;
}): Promise<void> {
  return setDoc(doc(posterLinksCol, crypto.randomUUID()), data);
}

export function updatePosterLink(
  id: string,
  data: Partial<{ platform: PosterLink["platform"]; label: string }>
): Promise<void> {
  return updateDoc(doc(posterLinksCol, id), data);
}

export function removePosterLink(id: string): Promise<void> {
  return deleteDoc(doc(posterLinksCol, id));
}

// ---------- صور البانر المتحرك (hero carousel) ----------

const heroImagesCol = collection(db, "heroImages");

export function subscribeHeroImages(cb: (images: HeroImage[]) => void): Unsubscribe {
  return onSnapshot(heroImagesCol, (snap) => {
    const images = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HeroImage, "id">) }));
    cb(images.sort((a, b) => a.order - b.order));
  });
}

export function addHeroImage(imageUrl: string, order: number): Promise<void> {
  return setDoc(doc(heroImagesCol, crypto.randomUUID()), { imageUrl, order });
}

export function removeHeroImage(id: string): Promise<void> {
  return deleteDoc(doc(heroImagesCol, id));
}

// ---------- إعدادات النسخ الاحتياطي التلقائي ----------

const backupConfigRef = doc(settingsCol, "backupConfig");

export function subscribeBackupConfig(cb: (config: BackupConfig | null) => void): Unsubscribe {
  return onSnapshot(backupConfigRef, (snap) => {
    cb(snap.exists() ? (snap.data() as BackupConfig) : null);
  });
}

export async function getBackupConfigOnce(): Promise<BackupConfig | null> {
  const snap = await getDoc(backupConfigRef);
  return snap.exists() ? (snap.data() as BackupConfig) : null;
}

export function saveBackupConfig(config: BackupConfig): Promise<void> {
  return setDoc(backupConfigRef, config, { merge: true });
}

// ---------- قراءة حية (real-time) ----------

export function subscribeRestaurant(
  cb: (restaurant: Restaurant | null) => void
): Unsubscribe {
  return onSnapshot(doc(settingsCol, "restaurant"), (snap) => {
    cb(snap.exists() ? (snap.data() as Restaurant) : null);
  });
}

/** قراءة مرة واحدة (بدون اشتراك حي) — تُستخدم في السيرفر لـ generateMetadata والـ manifest. */
export async function getRestaurantOnce(): Promise<Restaurant | null> {
  try {
    const snap = await getDoc(doc(settingsCol, "restaurant"));
    return snap.exists() ? (snap.data() as Restaurant) : null;
  } catch {
    return null;
  }
}

/** قراءة مرة واحدة للفئات والأصناف — تُستخدم في السيرفر لبيانات SEO المنسّقة (JSON-LD) فقط. */
export async function getMenuOnce(): Promise<
  { id: string; name: string; icon: string; items: FirestoreItem[] }[]
> {
  try {
    const [categoriesSnap, itemsSnap] = await Promise.all([getDocs(categoriesCol), getDocs(itemsCol)]);
    const categories = categoriesSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<FirestoreCategory, "id">),
    }));
    const items = itemsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FirestoreItem, "id">) }));
    return categories
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        items: items.filter((item) => item.categoryId === category.id && item.available !== false),
      }));
  } catch {
    return [];
  }
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
  discountPrice?: number;
  discountEndsAt?: Timestamp;
  variants?: MenuItem["variants"];
  badge?: MenuItem["badge"];
  available?: boolean;
  imageUrl?: string;
  supplierId?: string;
  order: number;
}): Promise<void> {
  // معرّف عشوائي دايمًا (مش slug من الاسم) — عشان لو الأدمن ضاف صنفين
  // بنفس الاسم (زي مورد مختلف أو حالة مختلفة)، التاني ميدوسش على الأول.
  return setDoc(doc(itemsCol, crypto.randomUUID()), { ...data, createdAt: serverTimestamp() });
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

// ---------- سجل الطلبات ----------
// الكتابة مفتوحة لأي زبون (بيبعت الطلب من غير تسجيل دخول)، والقراءة مقصورة
// على الأدمن فقط (بيانات عملاء خاصة) — عكس باقي المجموعات. شوف firestore.rules.

const ordersCol = collection(db, "orders");

/** Firestore بيرفض قيم undefined صريحة — بنشيلها قبل الكتابة بدل ما نتأكد يدويًا في كل مكان. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export async function saveOrder(order: Omit<Order, "id" | "createdAt">): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(ordersCol), {
    ...stripUndefined(order),
    items: order.items.map((line) => stripUndefined(line)),
    createdAt: serverTimestamp(),
  });
  order.items.forEach((line) => {
    batch.update(doc(itemsCol, line.itemId), { orderCount: increment(line.qty) });
  });
  await batch.commit();
}

export function subscribeOrders(cb: (orders: Order[]) => void): Unsubscribe {
  const q = query(ordersCol, orderBy("createdAt", "desc"), limit(200));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) })));
  });
}
