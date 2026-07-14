"use client";

import { useMemo, useState } from "react";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import CartBar from "@/components/CartBar";
import { useMenuData } from "@/hooks/useMenuData";

const PAGE_SIZE = 15; // 5 صفوف × 3 أعمدة في الشاشات الكبيرة

function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 animate-pulse">
      <div className="mx-auto mb-5 h-20 w-20 rounded-2xl bg-surface" />
      <div className="mx-auto h-8 w-48 rounded bg-surface" />
      <div className="mt-6 space-y-3">
        <div className="h-16 rounded-xl bg-surface/60" />
        <div className="h-16 rounded-xl bg-surface/60" />
        <div className="h-16 rounded-xl bg-surface/60" />
      </div>
    </div>
  );
}

export default function MenuLive() {
  const { restaurant, categories, loading } = useMenuData();
  const [activeCategory, setActiveCategory] = useState("all");
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => {
    return categories
      .flatMap((category) =>
        category.items
          .filter((item) => item.available !== false)
          .map((item) => ({ ...item, categoryId: category.id }))
      )
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  }, [categories]);

  const filteredItems = useMemo(
    () =>
      activeCategory === "all"
        ? allItems
        : allItems.filter((item) => item.categoryId === activeCategory),
    [allItems, activeCategory]
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (loading) {
    return <MenuSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-muted">
        <p>لم تتم تعبئة بيانات المطعم بعد.</p>
        <a href="/admin/login" className="mt-4 inline-block text-gold hover:text-gold-soft">
          الذهاب إلى لوحة التحكم
        </a>
      </div>
    );
  }

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };

  return (
    <>
      <MenuHeader restaurant={restaurant} />
      <CategoryNav
        items={categories.map((c) => ({ id: c.id, name: c.name }))}
        active={activeCategory}
        onSelect={handleSelectCategory}
      />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {pageItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((item) => (
              <MenuItemCard key={item.id} item={item} currency={restaurant.currency} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted">لا توجد أصناف متاحة.</p>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  p === currentPage
                    ? "border-gold bg-gold text-base"
                    : "border-line bg-surface text-muted hover:border-gold/40 hover:text-cream"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-muted">
          <p className="font-display text-sm text-cream">{restaurant.name} — جميع الأسعار شاملة الخدمة</p>
        </div>
      </footer>

      <CartBar restaurant={restaurant} />
    </>
  );
}
