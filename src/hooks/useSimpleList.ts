"use client";

import { useEffect, useState } from "react";
import type { Unsubscribe } from "firebase/firestore";
import type { SimpleListItem } from "@/types/menu";

type SimpleListApi = {
  subscribe: (cb: (items: SimpleListItem[]) => void) => Unsubscribe;
};

export function useSimpleList(api: SimpleListApi): {
  items: SimpleListItem[];
  loading: boolean;
} {
  const [items, setItems] = useState<SimpleListItem[] | null>(null);

  useEffect(() => {
    return api.subscribe(setItems);
  }, [api]);

  return { items: items ?? [], loading: items === null };
}
