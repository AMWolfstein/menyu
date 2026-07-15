"use client";

import { useState } from "react";
import type { LiveMenuCategory } from "@/hooks/useMenuData";
import { deleteCategory } from "@/lib/firestore";
import { PencilIcon, TrashIcon, PlusIcon } from "@/components/admin/icons";
import CategoryFormModal from "@/components/admin/CategoryFormModal";

export default function CategorySidebar({
  categories,
  activeCategoryId,
  onSelect,
}: {
  categories: LiveMenuCategory[];
  activeCategoryId: string;
  onSelect: (id: string) => void;
}) {
  const [modalTarget, setModalTarget] = useState<"add" | LiveMenuCategory | null>(null);

  const handleDelete = async (category: LiveMenuCategory) => {
    const confirmed = window.confirm(
      `سيتم حذف قسم "${category.name}" وكل أصنافه (${category.items.length}). متابعة؟`
    );
    if (!confirmed) return;
    await deleteCategory(category.id);
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:w-56 sm:shrink-0 sm:flex-col sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <div
              key={category.id}
              className={`flex shrink-0 items-center gap-0.5 rounded-lg border p-1 text-sm font-medium transition-colors sm:w-full ${
                isActive
                  ? "border-gold bg-gold text-base"
                  : "border-line bg-surface/60 text-cream hover:border-gold/40"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                className="flex flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-start"
              >
                {category.icon && <span>{category.icon}</span>}
                <span className="truncate">{category.name}</span>
                <span className={isActive ? "text-base/70" : "text-muted"}>
                  ({category.items.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTarget(category)}
                aria-label="تعديل الفئة"
                className={`shrink-0 rounded p-1.5 transition-colors ${isActive ? "hover:bg-base/20" : "hover:bg-surface-2"}`}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                aria-label="حذف الفئة"
                className={`shrink-0 rounded p-1.5 transition-colors ${isActive ? "hover:bg-base/20" : "hover:bg-surface-2"}`}
              >
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setModalTarget("add")}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/50 px-3 py-2 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/5 sm:w-full"
        >
          <PlusIcon className="h-4 w-4" />
          إضافة فئة
        </button>
      </div>

      {modalTarget && (
        <CategoryFormModal
          editing={modalTarget === "add" ? null : modalTarget}
          order={categories.length}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
  );
}
