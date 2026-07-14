"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteField } from "firebase/firestore";
import { addItem, deleteItem, updateItem } from "@/lib/firestore";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItem, SimpleListItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

const badges: NonNullable<MenuItem["badge"]>[] = ["عادي", "نباتي", "حار"];

type ItemDraft = {
  name: string;
  description: string;
  price: string;
  badge: string;
  categoryId: string;
  imageUrl: string;
  supplierId: string;
};

const emptyDraft = (categoryId: string): ItemDraft => ({
  name: "",
  description: "",
  price: "",
  badge: "عادي",
  categoryId,
  imageUrl: "",
  supplierId: "",
});

export default function ItemForm({
  categories,
  currency,
  suppliers,
}: {
  categories: LiveMenuCategory[];
  currency: string;
  suppliers: SimpleListItem[];
}) {
  const [addDraft, setAddDraft] = useState<ItemDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft | null>(null);

  const startAdd = (categoryId: string) => setAddDraft(emptyDraft(categoryId));

  const submitAdd = async (e: React.FormEvent, category: LiveMenuCategory) => {
    e.preventDefault();
    if (!addDraft || !addDraft.name.trim()) return;
    // Firestore rejects literal `undefined` field values, so optional fields
    // are only included when actually set — never written as `undefined`.
    await addItem({
      categoryId: category.id,
      name: addDraft.name,
      description: addDraft.description,
      price: Number(addDraft.price) || 0,
      available: true,
      order: category.items.length,
      ...(addDraft.badge && { badge: addDraft.badge as MenuItem["badge"] }),
      ...(addDraft.imageUrl && { imageUrl: addDraft.imageUrl }),
      ...(addDraft.supplierId && { supplierId: addDraft.supplierId }),
    });
    setAddDraft(null);
  };

  const startEdit = (item: LiveMenuItem) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      badge: item.badge ?? "عادي",
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? "",
      supplierId: item.supplierId ?? "",
    });
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    // deleteField() actually removes the field; a literal `undefined` would
    // make Firestore throw, so cleared optional fields use the sentinel.
    await updateItem(id, {
      name: editDraft.name,
      description: editDraft.description,
      price: Number(editDraft.price) || 0,
      categoryId: editDraft.categoryId,
      badge: editDraft.badge ? (editDraft.badge as MenuItem["badge"]) : deleteField(),
      imageUrl: editDraft.imageUrl ? editDraft.imageUrl : deleteField(),
      supplierId: editDraft.supplierId ? editDraft.supplierId : deleteField(),
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
                      <div className="flex flex-col gap-3">
                        <ImageUploadField
                          label="صورة الصنف"
                          value={editDraft.imageUrl || undefined}
                          onChange={(url) => setEditDraft({ ...editDraft, imageUrl: url })}
                          folder="items"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className={inputClass}
                            value={editDraft.name}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, name: e.target.value })
                            }
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
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, price: e.target.value })
                            }
                            placeholder="السعر"
                          />
                          <select
                            className={inputClass}
                            value={editDraft.badge}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, badge: e.target.value })
                            }
                          >
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
                          <select
                            className={inputClass}
                            value={editDraft.supplierId}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, supplierId: e.target.value })
                            }
                          >
                            <option value="">بدون مورد</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
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
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-line">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <ProductImagePlaceholder className="h-full w-full" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-sm ${available ? "text-cream" : "text-muted line-through"}`}
                            >
                              {item.name}
                            </p>
                            <p className="text-xs text-muted">
                              {formatPrice(item.price, currency)}
                              {item.badge ? ` · ${item.badge}` : ""}
                              {item.supplierId
                                ? ` · ${suppliers.find((s) => s.id === item.supplierId)?.name ?? ""}`
                                : ""}
                            </p>
                          </div>
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
                          <button
                            onClick={() => startEdit(item)}
                            className="text-gold hover:text-gold-soft"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-chili hover:opacity-80"
                          >
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
                className="mt-2 flex flex-col gap-3"
              >
                <ImageUploadField
                  label="صورة الصنف"
                  value={addDraft.imageUrl || undefined}
                  onChange={(url) => setAddDraft({ ...addDraft, imageUrl: url })}
                  folder="items"
                />
                <div className="flex flex-wrap items-center gap-2">
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
                    onChange={(e) =>
                      setAddDraft({ ...addDraft, description: e.target.value })
                    }
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
                    {badges.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <select
                    className={inputClass}
                    value={addDraft.supplierId}
                    onChange={(e) => setAddDraft({ ...addDraft, supplierId: e.target.value })}
                  >
                    <option value="">بدون مورد</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
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
                </div>
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
