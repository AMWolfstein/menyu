"use client";

import { useMemo, useState } from "react";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import CartBar from "@/components/CartBar";
import { useMenuData } from "@/hooks/useMenuData";
import { useSimpleList } from "@/hooks/useSimpleList";
import { suppliersApi } from "@/lib/firestore";
import { isDiscountActive, getDiscountPercent } from "@/lib/discount";

const PAGE_SIZE = 12; // يتقسم بالظبط على 2 (موبايل) و3 (شاشات كبيرة) و4 أعمدة

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
  const { items: suppliers } = useSimpleList(suppliersApi);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSupplier, setActiveSupplier] = useState<{ id: string; name: string } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => {
    return categories
      .flatMap((category) =>
        category.items
          .filter((item) => item.available !== false)
          .map((item) => ({
            ...item,
            categoryId: category.id,
            supplierName: suppliers.find((s) => s.id === item.supplierId)?.name,
          }))
      )
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  }, [categories, suppliers]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }
    if (activeSupplier) {
      return allItems.filter((item) => item.supplierId === activeSupplier.id);
    }
    if (activeCategory === "discounts") {
      return allItems
        .filter((item) => isDiscountActive(item))
        .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    }
    return activeCategory === "all"
      ? allItems
      : allItems.filter((item) => item.categoryId === activeCategory);
  }, [allItems, activeCategory, activeSupplier, searchQuery]);

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
    setActiveSupplier(null);
    setPage(1);
  };

  const handleSelectSupplier = (id: string, name: string) => {
    setActiveSupplier({ id, name });
    setActiveCategory("all");
    setPage(1);
  };

  return (
    <>
      <MenuHeader restaurant={restaurant} />
      <CategoryNav
        items={[
          { id: "all", name: "الكل" },
          { id: "discounts", name: "خصومات", icon: "🏷️" },
          ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
        ]}
        active={activeCategory}
        onSelect={handleSelectCategory}
      />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        <div className="relative mb-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث عن صنف..."
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 -translate-y-1/2 start-3 text-muted hover:text-cream"
              aria-label="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>

        {activeSupplier && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm">
            <span className="text-cream">
              أصناف المورد: <span className="font-bold text-gold">{activeSupplier.name}</span>
            </span>
            <button
              onClick={() => {
                setActiveSupplier(null);
                setPage(1);
              }}
              className="text-muted hover:text-cream"
            >
              ✕ إلغاء
            </button>
          </div>
        )}

        {pageItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {pageItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                currency={restaurant.currency}
                onSupplierClick={handleSelectSupplier}
              />
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
