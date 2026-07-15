"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type CartItem = {
  /** مفتاح فريد للسطر في السلة — نفس معرّف الصنف عادةً، أو معرّف مركّب لو فيه وزن مختار (عشان أوزان الصنف الواحد تتفرق في السلة). */
  id: string;
  /** معرّف صنف Firestore الحقيقي — دايمًا بيفضل نفسه بغض النظر عن الوزن المختار. */
  itemId: string;
  name: string;
  variantLabel?: string;
  price: number;
  /** السعر الأصلي قبل الخصم — بيتحط بس لو الصنف كان عليه خصم وقت الإضافة، تُستخدم لحساب "وفّرت" في رسالة الواتساب. */
  originalPrice?: number;
  imageUrl?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "menyu-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Deliberately deferred to after mount (not a useState lazy initializer):
      // the server render has no localStorage, so reading it synchronously
      // during the first client render would mismatch the SSR'd empty cart.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage غير متاح أو محتوى تالف — نبدأ بسلة فاضية.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const setQty: CartContextValue["setQty"] = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => setItems([]);

  const { itemCount, total } = useMemo(
    () => ({
      itemCount: items.reduce((sum, i) => sum + i.qty, 0),
      total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, removeItem, setQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
