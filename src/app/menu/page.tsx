"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMenuData } from "@/hooks/useMenuData";
import { usePosterLinks } from "@/hooks/usePosterLinks";
import { useSimpleList } from "@/hooks/useSimpleList";
import { suppliersApi } from "@/lib/firestore";
import MenuBoard from "@/components/MenuBoard";

export default function MenuImagesPage() {
  const { restaurant, categories, loading } = useMenuData();
  const { links: posterLinks } = usePosterLinks();
  const { items: suppliers } = useSimpleList(suppliersApi);

  const categoriesWithSuppliers = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          supplierName: suppliers.find((s) => s.id === item.supplierId)?.name,
        })),
      })),
    [categories, suppliers]
  );

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24 text-muted">
        جارٍ التحميل...
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex flex-1 items-center justify-center py-24 text-muted">
        لم تتم تعبئة بيانات المطعم بعد.
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-10">
      <MenuBoard categories={categoriesWithSuppliers} restaurant={restaurant} posterLinks={posterLinks} />

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gold hover:text-gold-soft">
          العودة إلى المنيو
        </Link>
      </div>
    </main>
  );
}
