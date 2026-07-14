"use client";

import { useEffect, useMemo, useState } from "react";
import type { Timestamp } from "firebase/firestore";
import {
  subscribeCategories,
  subscribeItems,
  subscribeRestaurant,
  type FirestoreCategory,
  type FirestoreItem,
} from "@/lib/firestore";
import type { MenuItem, Restaurant } from "@/types/menu";

export type LiveMenuItem = MenuItem & {
  categoryId: string;
  order: number;
  createdAt?: Timestamp;
  discountEndsAt?: Timestamp;
};
export type LiveMenuCategory = {
  id: string;
  name: string;
  icon: string;
  order: number;
  items: LiveMenuItem[];
};

type MenuData = {
  restaurant: Restaurant | null;
  categories: LiveMenuCategory[];
  loading: boolean;
};

/**
 * مصدر واحد للحقيقة لبيانات المنيو الحية (Firestore onSnapshot)، تستخدمه
 * صفحة المنيو العامة ولوحة التحكم معًا. يرجّع كل الأصناف بما فيها غير
 * المتوفرة — كل مستهلك يقرر بنفسه كيف يعرض `available`.
 */
export function useMenuData(): MenuData {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantLoaded, setRestaurantLoaded] = useState(false);
  const [rawCategories, setRawCategories] = useState<FirestoreCategory[] | null>(null);
  const [rawItems, setRawItems] = useState<FirestoreItem[] | null>(null);

  useEffect(() => {
    const unsubRestaurant = subscribeRestaurant((r) => {
      setRestaurant(r);
      setRestaurantLoaded(true);
    });
    const unsubCategories = subscribeCategories(setRawCategories);
    const unsubItems = subscribeItems(setRawItems);
    return () => {
      unsubRestaurant();
      unsubCategories();
      unsubItems();
    };
  }, []);

  const categories = useMemo<LiveMenuCategory[]>(() => {
    if (!rawCategories || !rawItems) return [];
    return [...rawCategories]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        order: category.order,
        items: rawItems
          .filter((item) => item.categoryId === category.id)
          .sort((a, b) => a.order - b.order),
      }));
  }, [rawCategories, rawItems]);

  const loading = !restaurantLoaded || rawCategories === null || rawItems === null;

  return { restaurant, categories, loading };
}
