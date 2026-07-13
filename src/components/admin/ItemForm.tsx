"use client";

import { useState } from "react";
import { addItem, deleteItem, updateItem } from "@/lib/firestore";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

const badges: NonNullable<MenuItem["badge"]>[] = ["الأكثر طلباً", "جديد", "نباتي", "حار"];

type ItemDraft = {
  name: string;
  description: string;
  price: string;
  badge: string;
  categoryId: string;
};

const emptyDraft = (categoryId: string): ItemDraft => ({
  name: "",
  description: "",
  price: "",
  badge: "",
  categoryId,
});

export default function ItemForm({
  categories,
  currency,
}: {
  categories: LiveMenuCategory[];
  currency: string;
}) {
  const [addDraft, setAddDraft] = useState<ItemDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft | null>(null);

  const startAdd = (categoryId: string) => setAddDraft(emptyDraft(categoryId));

  const submitAdd = async (e: React.FormEvent, category: LiveMenuCategory) => {
    e.preventDefault();
    if (!addDraft || !addDraft.name.trim()) return;
    await addItem({
      categoryId: category.id,
      name: addDraft.name,
      description: addDraft.description,
      price: Number(addDraft.price) || 0,
      badge: (addDraft.badge || undefined) as MenuItem["badge"],
      available: true,
      order: category.items.length,
    });
    setAddDraft(null);
  };

  const startEdit = (item: LiveMenuItem) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      badge: item.badge ?? "",
      categoryId: item.categoryId,
    });
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    await updateItem(id, {
      name: editDraft.name,
      description: editDraft.description,
      price: Number(editDraft.price) || 0,
      badge: (editDraft.badge || undefined) as MenuItem["badge"],
      categoryId: editDraft.categoryId,
    });
    setEditingId(null);
  };

  const toggleAvailable = (item: LiveMenuItem) => {
    updateItem(item.id, { available: !(item.available !== false) });
  };

  const handleDelete = async (item: LiveMenuItem) => {
    if (!window.confirm(`حذف صنف "${item.name}"؟`)) return;
    await deleteItem(item.id);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">الأصناف</h2>

      <div className="mt-4 space-y-6">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="text-sm font-bold text-gold-soft">{category.name}</h3>

            <ul className="mt-2 space-y-2">
              {category.items.map((item) => {
                const available = item.available !== false;
                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-line bg-base/40 px-3 py-2"
                  >
                    {editingId === item.id && editDraft ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          className={inputClass}
                          value={editDraft.name}
                          onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                          placeholder="الاسم"
                        />
                        <input
                          className={inputClass}
                          value={editDraft.description}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, description: e.target.value })
                          }
                          placeholder="الوصف"
                        />
                        <input
                          className={inputClass}
                          type="number"
                          value={editDraft.price}
                          onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })}
                          placeholder="السعر"
                        />
                        <select
                          className={inputClass}
                          value={editDraft.badge}
                          onChange={(e) => setEditDraft({ ...editDraft, badge: e.target.value })}
                        >
                          <option value="">بدون</option>
                          {badges.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <select
                          className={inputClass}
                          value={editDraft.categoryId}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, categoryId: e.target.value })
                          }
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveEdit(item.id)}
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
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm ${available ? "text-cream" : "text-muted line-through"}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted">
                            {formatPrice(item.price, currency)}
                            {item.badge ? ` · ${item.badge}` : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-xs">
                          <label className="flex items-center gap-1.5 text-muted">
                            <input
                              type="checkbox"
                              checked={available}
                              onChange={() => toggleAvailable(item)}
                            />
                            متوفر
                          </label>
                          <button onClick={() => startEdit(item)} className="text-gold hover:text-gold-soft">
                            تعديل
                          </button>
                          <button onClick={() => handleDelete(item)} className="text-chili hover:opacity-80">
                            حذف
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {addDraft && addDraft.categoryId === category.id ? (
              <form
                onSubmit={(e) => submitAdd(e, category)}
                className="mt-2 flex flex-wrap items-center gap-2"
              >
                <input
                  className={inputClass}
                  placeholder="الاسم"
                  value={addDraft.name}
                  onChange={(e) => setAddDraft({ ...addDraft, name: e.target.value })}
                  required
                />
                <input
                  className={inputClass}
                  placeholder="الوصف"
                  value={addDraft.description}
                  onChange={(e) => setAddDraft({ ...addDraft, description: e.target.value })}
                />
                <input
                  className={inputClass}
                  type="number"
                  placeholder="السعر"
                  value={addDraft.price}
                  onChange={(e) => setAddDraft({ ...addDraft, price: e.target.value })}
                  required
                />
                <select
                  className={inputClass}
                  value={addDraft.badge}
                  onChange={(e) => setAddDraft({ ...addDraft, badge: e.target.value })}
                >
                  <option value="">بدون</option>
                  {badges.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-base hover:bg-gold-soft"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setAddDraft(null)}
                  className="text-xs text-muted hover:text-cream"
                >
                  إلغاء
                </button>
              </form>
            ) : (
              <button
                onClick={() => startAdd(category.id)}
                className="mt-2 text-xs text-gold hover:text-gold-soft"
              >
                + إضافة صنف
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
