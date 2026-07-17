"use client";

import Link from "next/link";
import { useMenuData } from "@/hooks/useMenuData";
import { usePosterLinks } from "@/hooks/usePosterLinks";
import MenuBoard from "@/components/MenuBoard";

export default function MenuImagesPage() {
  const { restaurant, categories, loading } = useMenuData();
  const { links: posterLinks } = usePosterLinks();

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
      <MenuBoard categories={categories} restaurant={restaurant} posterLinks={posterLinks} />

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gold hover:text-gold-soft">
          العودة إلى المنيو
        </Link>
      </div>
    </main>
  );
}
