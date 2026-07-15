"use client";

import Link from "next/link";
import { useMenuData } from "@/hooks/useMenuData";
import MenuPosterCard from "@/components/MenuPosterCard";
import CombinedMenuPoster from "@/components/CombinedMenuPoster";

export default function MenuImagesPage() {
  const { restaurant, categories, loading } = useMenuData();

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
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-2xl font-extrabold text-cream">صور المنيو للمشاركة</h1>
        <p className="mt-2 text-sm text-muted">
          صورة جاهزة لكل قسم — دوس &quot;تحميل كصورة&quot; تحت أي قسم عشان تنزّله وتشاركه، أو حمّل
          المنيو كامل في صورة واحدة.
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center">
        <CombinedMenuPoster categories={categories} restaurant={restaurant} />
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-10 border-t border-line pt-10">
        {categories.map((category) => (
          <MenuPosterCard key={category.id} category={category} restaurant={restaurant} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-sm text-gold hover:text-gold-soft">
          العودة إلى المنيو
        </Link>
      </div>
    </main>
  );
}
