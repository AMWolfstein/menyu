"use client";

import { useState } from "react";
import { addCategory, deleteCategory, updateCategory } from "@/lib/firestore";
import type { LiveMenuCategory } from "@/hooks/useMenuData";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

export default function CategoryForm({ categories }: { categories: LiveMenuCategory[] }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addCategory({ name, icon, order: categories.length });
    setName("");
    setIcon("");
  };

  const startEdit = (category: LiveMenuCategory) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon);
  };

  const saveEdit = async (id: string) => {
    await updateCategory(id, { name: editName, icon: editIcon });
    setEditingId(null);
  };

  const handleDelete = async (category: LiveMenuCategory) => {
    const confirmed = window.confirm(
      `سيتم حذف قسم "${category.name}" وكل أصنافه (${category.items.length}). متابعة؟`
    );
    if (!confirmed) return;
    await deleteCategory(category.id);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">الفئات</h2>

      <ul className="mt-4 space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-base/40 px-3 py-2"
          >
            {editingId === category.id ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className={inputClass}
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                />
                <button
                  onClick={() => saveEdit(category.id)}
                  className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-base hover:bg-gold-soft"
                >
                  حفظ
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-muted hover:text-cream"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm text-cream">
                  {category.name} <span className="text-muted">({category.items.length})</span>
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => startEdit(category)} className="text-gold hover:text-gold-soft">
                    تعديل
                  </button>
                  <button onClick={() => handleDelete(category)} className="text-chili hover:opacity-80">
                    حذف
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className={inputClass}
          placeholder="اسم الفئة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={inputClass}
          placeholder="رمز توضيحي"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft"
        >
          إضافة فئة
        </button>
      </form>
    </div>
  );
}
