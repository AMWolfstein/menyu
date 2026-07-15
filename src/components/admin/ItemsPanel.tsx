"use client";

import { useState } from "react";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { SimpleListItem } from "@/types/menu";
import { deleteItem, updateItem } from "@/lib/firestore";
import CategorySidebar from "@/components/admin/CategorySidebar";
import ItemCard from "@/components/admin/ItemCard";
import ItemFormModal from "@/components/admin/ItemFormModal";
import { PlusIcon } from "@/components/admin/icons";

export default function ItemsPanel({
  categories,
  currency,
  suppliers,
  restaurantLogoUrl,
}: {
  categories: LiveMenuCategory[];
  currency: string;
  suppliers: SimpleListItem[];
  restaurantLogoUrl?: string;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<LiveMenuItem | null>(null);

  // لو لسه محددناش فئة (أو الفئة المحددة اتحذفت)، بنرجع لأول فئة تلقائيًا.
  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0] ?? null;

  const handleDelete = async (item: LiveMenuItem) => {
    if (!window.confirm(`حذف صنف "${item.name}"؟`)) return;
    await deleteItem(item.id);
  };

  const handleToggleAvailable = (item: LiveMenuItem) => {
    updateItem(item.id, { available: !(item.available !== false) });
  };

  if (categories.length === 0) {
    return <p className="text-sm text-muted">أضف فئة أولاً عشان تقدر تضيف أصناف.</p>;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <CategorySidebar
        categories={categories}
        activeCategoryId={activeCategory?.id ?? ""}
        onSelect={setActiveCategoryId}
      />

      <div className="min-w-0 flex-1">
        {activeCategory && (
          <>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-cream">
                {activeCategory.name}{" "}
                <span className="text-sm font-normal text-muted">
                  ({activeCategory.items.length})
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItem(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft"
              >
                <PlusIcon className="h-4 w-4" />
                إضافة صنف جديد
              </button>
            </div>

            {activeCategory.items.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {activeCategory.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currency={currency}
                    supplierName={suppliers.find((s) => s.id === item.supplierId)?.name}
                    logoUrl={restaurantLogoUrl}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDelete(item)}
                    onToggleAvailable={() => handleToggleAvailable(item)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-muted">
                لا توجد أصناف في هذه الفئة بعد.
              </p>
            )}
          </>
        )}
      </div>

      {showAddItem && activeCategory && (
        <ItemFormModal
          item={null}
          categoryId={activeCategory.id}
          categories={categories}
          suppliers={suppliers}
          restaurantLogoUrl={restaurantLogoUrl}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {editingItem && (
        <ItemFormModal
          item={editingItem}
          categoryId={editingItem.categoryId}
          categories={categories}
          suppliers={suppliers}
          restaurantLogoUrl={restaurantLogoUrl}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
