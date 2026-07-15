"use client";

import { useState } from "react";
import { deleteField, Timestamp } from "firebase/firestore";
import { addItem, updateItem } from "@/lib/firestore";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItem, MenuItemVariant, SimpleListItem } from "@/types/menu";
import Modal from "@/components/admin/Modal";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { PlusIcon, TrashIcon } from "@/components/admin/icons";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

const badges: NonNullable<MenuItem["badge"]>[] = ["عادي", "نباتي", "حار"];

type PriceRowDraft = { id: string; label: string; price: string; discountPrice: string };

type ItemDraft = {
  name: string;
  description: string;
  priceRows: PriceRowDraft[];
  discountPrice: string;
  discountEndsAt: string;
  badge: string;
  categoryId: string;
  imageUrl: string;
  supplierId: string;
};

/** السعر بعد الخصم اختياري، لكن لازم يكون رقم صحيح أقل من السعر الأساسي. */
function isValidDiscount(price: number, discountPrice: string): boolean {
  if (!discountPrice.trim()) return true;
  const d = Number(discountPrice);
  return Number.isFinite(d) && d > 0 && d < price;
}

/**
 * السعر والأوزان بقوا حاجة واحدة: لو صف واحد بس، الصنف بسعر ثابت (variants
 * فاضية) وخصمه على مستوى الصنف نفسه. لو أكتر من صف، كل صف بيتحول لوزن
 * (variant) بخصمه الخاص لو موجود — الصف الأول هو نفسه اللي بيتسجل كـ
 * `price` الأساسي، عشان باقي المشروع (السلة، السيو) يفضل شغال زي ما هو.
 */
function cleanPriceRows(rows: PriceRowDraft[]): { price: number; variants: MenuItemVariant[] } {
  const valid = rows.filter((r) => Number.isFinite(Number(r.price)) && Number(r.price) > 0);
  if (valid.length <= 1) {
    return { price: valid[0] ? Number(valid[0].price) : 0, variants: [] };
  }
  return {
    price: Number(valid[0].price),
    variants: valid.map((r) => ({
      id: r.id,
      label: r.label.trim(),
      price: Number(r.price),
      ...(r.discountPrice.trim() && { discountPrice: Number(r.discountPrice) }),
    })),
  };
}

function PriceRowsEditor({
  rows,
  onChange,
}: {
  rows: PriceRowDraft[];
  onChange: (rows: PriceRowDraft[]) => void;
}) {
  const hasMultiple = rows.length > 1;

  const addRow = () =>
    onChange([...rows, { id: crypto.randomUUID(), label: "", price: "", discountPrice: "" }]);
  const updateRow = (id: string, field: "label" | "price" | "discountPrice", value: string) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  if (!hasMultiple) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-base/30 p-3">
        <p className={labelClass}>السعر</p>
        <div className="flex items-center gap-2">
          <input
            className={inputClass}
            type="number"
            placeholder="السعر"
            value={rows[0]?.price ?? ""}
            onChange={(e) => updateRow(rows[0].id, "price", e.target.value)}
            required
          />
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex w-fit items-center gap-1 text-xs text-gold hover:text-gold-soft"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          إضافة وزن/سعر تاني
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-base/30 p-3">
      <p className={labelClass}>الأسعار والأوزان</p>
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-1.5 rounded-lg border border-line/60 p-2">
          <div className="flex items-center gap-2">
            <input
              className={inputClass}
              placeholder="مثال: 1 كيلو"
              value={row.label}
              onChange={(e) => updateRow(row.id, "label", e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => removeRow(row.id)}
              aria-label="حذف الوزن"
              className="shrink-0 rounded-lg p-2 text-chili transition-colors hover:bg-chili/10"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              type="number"
              placeholder="السعر"
              value={row.price}
              onChange={(e) => updateRow(row.id, "price", e.target.value)}
              required
            />
            <input
              className={inputClass}
              type="number"
              placeholder="خصم (اختياري)"
              value={row.discountPrice}
              onChange={(e) => updateRow(row.id, "discountPrice", e.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex w-fit items-center gap-1 text-xs text-gold hover:text-gold-soft"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        إضافة وزن/سعر تاني
      </button>
    </div>
  );
}

export default function ItemFormModal({
  item,
  categoryId,
  categories,
  suppliers,
  restaurantLogoUrl,
  onClose,
}: {
  /** null = وضع الإضافة، غير ذلك = وضع التعديل */
  item: LiveMenuItem | null;
  /** الفئة المستهدفة عند الإضافة */
  categoryId: string;
  categories: LiveMenuCategory[];
  suppliers: SimpleListItem[];
  restaurantLogoUrl?: string;
  onClose: () => void;
}) {
  const targetCategory = categories.find((c) => c.id === categoryId);

  const [draft, setDraft] = useState<ItemDraft>(() =>
    item
      ? {
          name: item.name,
          description: item.description,
          priceRows:
            item.variants && item.variants.length > 0
              ? item.variants.map((v) => ({
                  id: v.id,
                  label: v.label,
                  price: String(v.price),
                  discountPrice: v.discountPrice != null ? String(v.discountPrice) : "",
                }))
              : [
                  {
                    id: crypto.randomUUID(),
                    label: "",
                    price: String(item.price),
                    discountPrice: "",
                  },
                ],
          discountPrice: item.discountPrice != null ? String(item.discountPrice) : "",
          discountEndsAt: item.discountEndsAt
            ? item.discountEndsAt.toDate().toISOString().slice(0, 10)
            : "",
          badge: item.badge ?? "عادي",
          categoryId: item.categoryId,
          imageUrl: item.imageUrl ?? "",
          supplierId: item.supplierId ?? "",
        }
      : {
          name: "",
          description: "",
          priceRows: [{ id: crypto.randomUUID(), label: "", price: "", discountPrice: "" }],
          discountPrice: "",
          discountEndsAt: "",
          badge: "عادي",
          categoryId,
          imageUrl: "",
          supplierId: "",
        }
  );
  const [saving, setSaving] = useState(false);

  const isMulti = draft.priceRows.length > 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const { price, variants } = cleanPriceRows(draft.priceRows);
    if (price <= 0) {
      window.alert("لازم تحط سعر واحد صحيح على الأقل");
      return;
    }
    if (isMulti) {
      for (const row of draft.priceRows) {
        if (!Number.isFinite(Number(row.price)) || Number(row.price) <= 0) continue;
        if (!isValidDiscount(Number(row.price), row.discountPrice)) {
          window.alert(
            `السعر بعد الخصم لوزن "${row.label || "بدون اسم"}" لازم يكون رقم أقل من سعره`
          );
          return;
        }
      }
    } else if (!isValidDiscount(price, draft.discountPrice)) {
      window.alert("السعر بعد الخصم لازم يكون رقم أقل من السعر الأساسي");
      return;
    }
    setSaving(true);
    if (item) {
      // deleteField() actually removes the field; a literal `undefined` would
      // make Firestore throw, so cleared optional fields use the sentinel.
      await updateItem(item.id, {
        name: draft.name,
        description: draft.description,
        price,
        categoryId: draft.categoryId,
        badge: draft.badge ? (draft.badge as MenuItem["badge"]) : deleteField(),
        imageUrl: draft.imageUrl ? draft.imageUrl : deleteField(),
        supplierId: draft.supplierId ? draft.supplierId : deleteField(),
        discountPrice: !isMulti && draft.discountPrice ? Number(draft.discountPrice) : deleteField(),
        discountEndsAt: draft.discountEndsAt
          ? Timestamp.fromDate(new Date(`${draft.discountEndsAt}T23:59:59`))
          : deleteField(),
        variants: variants.length > 0 ? variants : deleteField(),
      });
    } else {
      // Firestore rejects literal `undefined` field values, so optional fields
      // are only included when actually set — never written as `undefined`.
      await addItem({
        categoryId,
        name: draft.name,
        description: draft.description,
        price,
        available: true,
        order: targetCategory?.items.length ?? 0,
        ...(draft.badge && { badge: draft.badge as MenuItem["badge"] }),
        ...(draft.imageUrl && { imageUrl: draft.imageUrl }),
        ...(draft.supplierId && { supplierId: draft.supplierId }),
        ...(!isMulti && draft.discountPrice && { discountPrice: Number(draft.discountPrice) }),
        ...(draft.discountEndsAt && {
          discountEndsAt: Timestamp.fromDate(new Date(`${draft.discountEndsAt}T23:59:59`)),
        }),
        ...(variants.length > 0 && { variants }),
      });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal title={item ? "تعديل الصنف" : "إضافة صنف جديد"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <ImageUploadField
          label="صورة الصنف"
          value={draft.imageUrl || undefined}
          onChange={(url) => setDraft({ ...draft, imageUrl: url })}
          folder="items"
          logoUrl={restaurantLogoUrl}
        />
        <div>
          <label className={labelClass}>الاسم</label>
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass}>الوصف</label>
          <input
            className={inputClass}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
        </div>

        <PriceRowsEditor
          rows={draft.priceRows}
          onChange={(priceRows) => setDraft({ ...draft, priceRows })}
        />

        {isMulti ? (
          <div>
            <label className={labelClass}>تاريخ انتهاء الخصم (اختياري)</label>
            <input
              className={inputClass}
              type="date"
              value={draft.discountEndsAt}
              onChange={(e) => setDraft({ ...draft, discountEndsAt: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted">
              بينطبق على أي وزن حطيت له خصم فوق.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>السعر بعد الخصم (اختياري)</label>
              <input
                className={inputClass}
                type="number"
                value={draft.discountPrice}
                onChange={(e) => setDraft({ ...draft, discountPrice: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>تاريخ انتهاء الخصم (اختياري)</label>
              <input
                className={inputClass}
                type="date"
                value={draft.discountEndsAt}
                onChange={(e) => setDraft({ ...draft, discountEndsAt: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>الحالة</label>
            <select
              className={inputClass}
              value={draft.badge}
              onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
            >
              {badges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>المورد</label>
            <select
              className={inputClass}
              value={draft.supplierId}
              onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}
            >
              <option value="">بدون مورد</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {item && (
          <div>
            <label className={labelClass}>الفئة</label>
            <select
              className={inputClass}
              value={draft.categoryId}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted hover:text-cream"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : item ? "حفظ" : "إضافة"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
