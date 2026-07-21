"use client";

import { useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import SocialLinks from "@/components/SocialLinks";
import { useMenuData, type LiveMenuItem } from "@/hooks/useMenuData";
import { useSimpleList } from "@/hooks/useSimpleList";
import { useHeroImages } from "@/hooks/useHeroImages";
import { useGridLayout } from "@/hooks/useGridLayout";
import { suppliersApi } from "@/lib/firestore";
import { itemHasAnyDiscount, getItemMaxDiscountPercent, getItemSortPrice } from "@/lib/discount";
import { getBestSellers, BEST_SELLER_BADGE_COUNT } from "@/lib/bestSellers";

const PAGE_SIZE = 12; // يتقسم بالظبط على 2 (موبايل) و3 (شاشات كبيرة) و4 أعمدة

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث أولاً" },
  { value: "oldest", label: "الأقدم أولاً" },
  { value: "priceAsc", label: "السعر: من الأقل للأعلى" },
  { value: "priceDesc", label: "السعر: من الأعلى للأقل" },
  { value: "supplierAsc", label: "المورد (أ-ي)" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function sortItems<T extends LiveMenuItem & { supplierName?: string }>(
  items: T[],
  sortOption: SortOption
): T[] {
  const sorted = [...items];
  switch (sortOption) {
    case "oldest":
      return sorted.sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
    case "priceAsc":
      return sorted.sort((a, b) => getItemSortPrice(a) - getItemSortPrice(b));
    case "priceDesc":
      return sorted.sort((a, b) => getItemSortPrice(b) - getItemSortPrice(a));
    case "supplierAsc":
      return sorted.sort((a, b) => (a.supplierName ?? "").localeCompare(b.supplierName ?? "", "ar"));
    case "newest":
    default:
      return sorted.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  }
}

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
  const { images: heroImages } = useHeroImages();
  const gridColumns = useGridLayout();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSupplier, setActiveSupplier] = useState<{ id: string; name: string } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => {
    const items = categories.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        categoryId: category.id,
        supplierName: suppliers.find((s) => s.id === item.supplierId)?.name,
      }))
    );
    return sortItems(items, sortOption);
  }, [categories, suppliers, sortOption]);

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
        .filter((item) => itemHasAnyDiscount(item))
        .sort((a, b) => getItemMaxDiscountPercent(b) - getItemMaxDiscountPercent(a));
    }
    return activeCategory === "all"
      ? allItems
      : allItems.filter((item) => item.categoryId === activeCategory);
  }, [allItems, activeCategory, activeSupplier, searchQuery]);

  const bestSellerIds = useMemo(() => {
    return new Set(getBestSellers(categories, BEST_SELLER_BADGE_COUNT).map((item) => item.id));
  }, [categories]);

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    setPage(1);
  };

  return (
    <>
      <TopBar restaurant={restaurant} searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <HeroCarousel images={heroImages} />
      <CategoryNav
        items={[
          { id: "all", name: "الكل" },
          { id: "discounts", name: "خصومات", icon: "🏷️" },
          ...categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
        ]}
        active={activeCategory}
        onSelect={handleSelectCategory}
      />

      <div className="mx-auto max-w-3xl px-4 pb-12 pt-6">
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

        {activeCategory !== "discounts" && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <label htmlFor="sort-select" className="text-xs text-muted">
              الترتيب:
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-cream focus:border-gold focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {pageItems.length > 0 ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
          >
            {pageItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                currency={restaurant.currency}
                onSupplierClick={handleSelectSupplier}
                logoUrl={restaurant.imageUrl}
                isBestSeller={bestSellerIds.has(item.id)}
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
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <SocialLinks restaurant={restaurant} />
        </div>
      </footer>
    </>
  );
}
