"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteField, Timestamp } from "firebase/firestore";
import { addItem, deleteItem, updateItem } from "@/lib/firestore";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItem, MenuItemVariant, SimpleListItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import { isDiscountActive } from "@/lib/discount";
import ImageUploadField from "@/components/admin/ImageUploadField";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

const badges: NonNullable<MenuItem["badge"]>[] = ["عادي", "نباتي", "حار"];

type VariantDraft = { id: string; label: string; price: string };

type ItemDraft = {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  discountEndsAt: string;
  badge: string;
  categoryId: string;
  imageUrl: string;
  supplierId: string;
  variants: VariantDraft[];
};

const emptyDraft = (categoryId: string): ItemDraft => ({
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  discountEndsAt: "",
  badge: "عادي",
  categoryId,
  imageUrl: "",
  supplierId: "",
  variants: [],
});

/** السعر بعد الخصم اختياري، لكن لازم يكون رقم صحيح أقل من السعر الأصلي. */
function isValidDiscount(price: string, discountPrice: string): boolean {
  if (!discountPrice.trim()) return true;
  const p = Number(price);
  const d = Number(discountPrice);
  return Number.isFinite(d) && d > 0 && d < p;
}

/** بيسيب بس الصفوف المكتملة (اسم + سعر رقمي صحيح)، وبيحوّلها لشكل MenuItemVariant. */
function cleanVariants(drafts: VariantDraft[]): MenuItemVariant[] {
  return drafts
    .filter((v) => v.label.trim() && Number.isFinite(Number(v.price)) && Number(v.price) > 0)
    .map((v) => ({
      id: v.id,
      label: v.label.trim(),
      price: Number(v.price),
    }));
}

function VariantsEditor({
  variants,
  onChange,
}: {
  variants: VariantDraft[];
  onChange: (variants: VariantDraft[]) => void;
}) {
  const addRow = () =>
    onChange([...variants, { id: crypto.randomUUID(), label: "", price: "" }]);
  const updateRow = (id: string, field: "label" | "price", value: string) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  const removeRow = (id: string) => onChange(variants.filter((v) => v.id !== id));

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-base/30 p-2">
      <p className="text-xs font-medium text-muted">الأوزان/الأحجام (اختياري)</p>
      {variants.map((v) => (
        <div key={v.id} className="flex items-center gap-2">
          <input
            className={inputClass}
            placeholder="مثال: 1 كيلو"
            value={v.label}
            onChange={(e) => updateRow(v.id, "label", e.target.value)}
          />
          <input
            className={inputClass}
            type="number"
            placeholder="السعر"
            value={v.price}
            onChange={(e) => updateRow(v.id, "price", e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(v.id)}
            className="text-xs text-chili hover:opacity-80"
          >
            حذف
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="w-fit text-xs text-gold hover:text-gold-soft"
      >
        + إضافة وزن
      </button>
    </div>
  );
}

export default function ItemForm({
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
  const [addDraft, setAddDraft] = useState<ItemDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft | null>(null);

  const startAdd = (categoryId: string) => setAddDraft(emptyDraft(categoryId));

  const submitAdd = async (e: React.FormEvent, category: LiveMenuCategory) => {
    e.preventDefault();
    if (!addDraft || !addDraft.name.trim()) return;
    if (!isValidDiscount(addDraft.price, addDraft.discountPrice)) {
      window.alert("السعر بعد الخصم لازم يكون رقم أقل من السعر الأصلي");
      return;
    }
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
      ...(addDraft.discountPrice && { discountPrice: Number(addDraft.discountPrice) }),
      ...(addDraft.discountEndsAt && {
        discountEndsAt: Timestamp.fromDate(new Date(`${addDraft.discountEndsAt}T23:59:59`)),
      }),
      ...(cleanVariants(addDraft.variants).length > 0 && {
        variants: cleanVariants(addDraft.variants),
      }),
    });
    setAddDraft(null);
  };

  const startEdit = (item: LiveMenuItem) => {
    setEditingId(item.id);
    setEditDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      discountPrice: item.discountPrice != null ? String(item.discountPrice) : "",
      discountEndsAt: item.discountEndsAt ? item.discountEndsAt.toDate().toISOString().slice(0, 10) : "",
      badge: item.badge ?? "عادي",
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? "",
      supplierId: item.supplierId ?? "",
      variants: (item.variants ?? []).map((v) => ({
        id: v.id,
        label: v.label,
        price: String(v.price),
      })),
    });
  };

  const saveEdit = async (id: string) => {
    if (!editDraft) return;
    if (!isValidDiscount(editDraft.price, editDraft.discountPrice)) {
      window.alert("السعر بعد الخصم لازم يكون رقم أقل من السعر الأصلي");
      return;
    }
    const variants = cleanVariants(editDraft.variants);
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
      discountPrice: editDraft.discountPrice ? Number(editDraft.discountPrice) : deleteField(),
      discountEndsAt: editDraft.discountEndsAt
        ? Timestamp.fromDate(new Date(`${editDraft.discountEndsAt}T23:59:59`))
        : deleteField(),
      variants: variants.length > 0 ? variants : deleteField(),
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
                          logoUrl={restaurantLogoUrl}
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
                          <input
                            className={inputClass}
                            type="number"
                            value={editDraft.discountPrice}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, discountPrice: e.target.value })
                            }
                            placeholder="السعر بعد الخصم (اختياري)"
                          />
                          <input
                            className={inputClass}
                            type="date"
                            value={editDraft.discountEndsAt}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, discountEndsAt: e.target.value })
                            }
                            title="تاريخ انتهاء الخصم (اختياري)"
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
                        <VariantsEditor
                          variants={editDraft.variants}
                          onChange={(variants) => setEditDraft({ ...editDraft, variants })}
                        />
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
                              <ProductImagePlaceholder
                                className="h-full w-full"
                                logoUrl={restaurantLogoUrl}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className={`text-sm ${available ? "text-cream" : "text-muted line-through"}`}
                            >
                              {item.name}
                            </p>
                            <p className="text-xs text-muted">
                              {item.discountPrice ? (
                                <>
                                  <span className="line-through">
                                    {formatPrice(item.price, currency)}
                                  </span>{" "}
                                  <span className="text-chili">
                                    {formatPrice(item.discountPrice, currency)}
                                  </span>
                                  {!isDiscountActive(item) && (
                                    <span className="text-muted"> (منتهي)</span>
                                  )}
                                </>
                              ) : (
                                formatPrice(item.price, currency)
                              )}
                              {item.badge ? ` · ${item.badge}` : ""}
                              {item.supplierId
                                ? ` · ${suppliers.find((s) => s.id === item.supplierId)?.name ?? ""}`
                                : ""}
                              {item.variants && item.variants.length > 0
                                ? ` · ${item.variants.length} أوزان`
                                : ""}
                              {item.orderCount ? ` · طُلب ${item.orderCount} مرة` : ""}
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
                  logoUrl={restaurantLogoUrl}
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
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="السعر بعد الخصم (اختياري)"
                    value={addDraft.discountPrice}
                    onChange={(e) =>
                      setAddDraft({ ...addDraft, discountPrice: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    type="date"
                    value={addDraft.discountEndsAt}
                    onChange={(e) =>
                      setAddDraft({ ...addDraft, discountEndsAt: e.target.value })
                    }
                    title="تاريخ انتهاء الخصم (اختياري)"
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
                <VariantsEditor
                  variants={addDraft.variants}
                  onChange={(variants) => setAddDraft({ ...addDraft, variants })}
                />
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
