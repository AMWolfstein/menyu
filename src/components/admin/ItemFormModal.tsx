"use client";

import { useState } from "react";
import { deleteField, Timestamp } from "firebase/firestore";
import { addItem, updateItem } from "@/lib/firestore";
import {
  itemHasAnyDiscount,
  getItemMaxDiscountPercent,
  isDiscountActive,
  pickCheapestVariant,
} from "@/lib/discount";
import { notifyDiscount } from "@/lib/notifyDiscount";
import { notifyNewItem } from "@/lib/notifyNewItem";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItem, MenuItemVariant, SimpleListItem } from "@/types/menu";
import Modal from "@/components/admin/Modal";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { PlusIcon, TrashIcon } from "@/components/admin/icons";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

const badges: NonNullable<MenuItem["badge"]>[] = ["عادي", "نباتي", "حار"];

type PriceRowDraft = {
  id: string;
  label: string;
  price: string;
  discountPrice: string;
  discountEndsAt: string;
};

type ItemDraft = {
  name: string;
  description: string;
  priceRows: PriceRowDraft[];
  badge: string;
  categoryId: string;
  imageUrl: string;
  supplierId: string;
};

const emptyRow = (): PriceRowDraft => ({
  id: crypto.randomUUID(),
  label: "",
  price: "",
  discountPrice: "",
  discountEndsAt: "",
});

/** السعر بعد الخصم اختياري، لكن لازم يكون رقم صحيح أقل من سعر نفس الصف. */
function isValidDiscount(price: number, discountPrice: string): boolean {
  if (!discountPrice.trim()) return true;
  const d = Number(discountPrice);
  return Number.isFinite(d) && d > 0 && d < price;
}

function toTimestamp(dateStr: string): Timestamp {
  return Timestamp.fromDate(new Date(`${dateStr}T23:59:59`));
}

/**
 * كل صف (وزن) مستقل بالكامل: سعره وخصمه وتاريخ انتهاء خصمه. الوزن بقى
 * إجباري في الفورم (شوف `required` تحت) فعمليًا كل صف بيوصل هنا معاه وزن،
 * لكن الفرع اللي من غير وزن اتسيب كـ fallback دفاعي (زي أصناف قديمة
 * محفوظة من قبل ما الوزن بقى إجباري).
 */
function cleanPriceRows(rows: PriceRowDraft[]) {
  const valid = rows.filter((r) => Number.isFinite(Number(r.price)) && Number(r.price) > 0);
  const hasAnyLabel = valid.some((r) => r.label.trim());

  if (valid.length === 0) {
    return { price: 0, discountPrice: undefined, discountEndsAt: undefined, variants: [] as MenuItemVariant[] };
  }

  if (valid.length === 1 && !hasAnyLabel) {
    const r = valid[0];
    return {
      price: Number(r.price),
      discountPrice: r.discountPrice.trim() ? Number(r.discountPrice) : undefined,
      discountEndsAt: r.discountEndsAt ? toTimestamp(r.discountEndsAt) : undefined,
      variants: [] as MenuItemVariant[],
    };
  }

  return {
    price: Number(valid[0].price),
    discountPrice: undefined,
    discountEndsAt: undefined,
    variants: valid.map((r) => ({
      id: r.id,
      label: r.label.trim(),
      price: Number(r.price),
      ...(r.discountPrice.trim() && { discountPrice: Number(r.discountPrice) }),
      ...(r.discountEndsAt && { discountEndsAt: toTimestamp(r.discountEndsAt) }),
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

  const addRow = () => onChange([...rows, emptyRow()]);
  const updateRow = (id: string, field: keyof Omit<PriceRowDraft, "id">, value: string) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-base/30 p-3">
      <p className={labelClass}>{hasMultiple ? "الأسعار والأوزان" : "السعر"}</p>
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
            {hasMultiple && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label="حذف الوزن"
                className="shrink-0 rounded-lg p-2 text-chili transition-colors hover:bg-chili/10"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
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
          <div>
            <label className="mb-1 block text-[11px] text-muted">
              تاريخ انتهاء الخصم (اختياري)
            </label>
            <input
              className={inputClass}
              type="date"
              value={row.discountEndsAt}
              onChange={(e) => updateRow(row.id, "discountEndsAt", e.target.value)}
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
  currency,
  restaurantLogoUrl,
  onClose,
}: {
  /** null = وضع الإضافة، غير ذلك = وضع التعديل */
  item: LiveMenuItem | null;
  /** الفئة المستهدفة عند الإضافة */
  categoryId: string;
  categories: LiveMenuCategory[];
  suppliers: SimpleListItem[];
  currency: string;
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
                  discountEndsAt: v.discountEndsAt
                    ? v.discountEndsAt.toDate().toISOString().slice(0, 10)
                    : "",
                }))
              : [
                  {
                    id: crypto.randomUUID(),
                    label: "",
                    price: String(item.price),
                    discountPrice: item.discountPrice != null ? String(item.discountPrice) : "",
                    discountEndsAt: item.discountEndsAt
                      ? item.discountEndsAt.toDate().toISOString().slice(0, 10)
                      : "",
                  },
                ],
          badge: item.badge ?? "عادي",
          categoryId: item.categoryId,
          imageUrl: item.imageUrl ?? "",
          supplierId: item.supplierId ?? "",
        }
      : {
          name: "",
          description: "",
          priceRows: [emptyRow()],
          badge: "عادي",
          categoryId,
          imageUrl: "",
          supplierId: "",
        }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;

    for (const r of draft.priceRows) {
      if (r.price.trim() === "") continue;
      const price = Number(r.price);
      if (!Number.isFinite(price) || price <= 0) {
        window.alert(`السعر لـ"${r.label || "الصف ده"}" لازم يكون رقم أكبر من صفر`);
        return;
      }
      if (!isValidDiscount(price, r.discountPrice)) {
        window.alert(
          `السعر بعد الخصم لـ"${r.label || "السعر الأساسي"}" لازم يكون رقم أقل من سعره`
        );
        return;
      }
    }

    const cleaned = cleanPriceRows(draft.priceRows);
    if (cleaned.price <= 0) {
      window.alert("لازم تحط سعر واحد صحيح على الأقل");
      return;
    }

    // نبعت إشعار بس لو الخصم جديد فعلاً أو نسبته اتغيّرت — مش في كل حفظة
    // متكررة لنفس الخصم.
    const newDiscountPercent = getItemMaxDiscountPercent(cleaned);
    const previousDiscountPercent = item ? getItemMaxDiscountPercent(item) : 0;
    const shouldNotify =
      itemHasAnyDiscount(cleaned) && newDiscountPercent !== previousDiscountPercent;

    // السعر اللي بيتعرض في الإشعار — لو فيه أوزان متعددة، بناخد أرخص وزن
    // فعليًا (نفس منطق التلخيص المستخدم في عرض السعر بالموقع).
    const notifyVariant = cleaned.variants.length > 0 ? pickCheapestVariant(cleaned) : undefined;
    const notifyPriceFields = notifyVariant
      ? {
          price: notifyVariant.price,
          discountPrice: notifyVariant.discountPrice,
          discountEndsAt: notifyVariant.discountEndsAt,
        }
      : cleaned;
    const notifyDiscountedPrice = isDiscountActive(notifyPriceFields)
      ? notifyPriceFields.discountPrice!
      : notifyPriceFields.price;

    setSaving(true);
    try {
      if (item) {
        // deleteField() actually removes the field; a literal `undefined` would
        // make Firestore throw, so cleared optional fields use the sentinel.
        await updateItem(item.id, {
          name: draft.name,
          description: draft.description,
          price: cleaned.price,
          categoryId: draft.categoryId,
          badge: draft.badge ? (draft.badge as MenuItem["badge"]) : deleteField(),
          imageUrl: draft.imageUrl ? draft.imageUrl : deleteField(),
          supplierId: draft.supplierId ? draft.supplierId : deleteField(),
          discountPrice: cleaned.discountPrice != null ? cleaned.discountPrice : deleteField(),
          discountEndsAt: cleaned.discountEndsAt ?? deleteField(),
          variants: cleaned.variants.length > 0 ? cleaned.variants : deleteField(),
        });
      } else {
        // Firestore rejects literal `undefined` field values, so optional fields
        // are only included when actually set — never written as `undefined`.
        await addItem({
          categoryId,
          name: draft.name,
          description: draft.description,
          price: cleaned.price,
          available: true,
          order: targetCategory?.items.length ?? 0,
          ...(draft.badge && { badge: draft.badge as MenuItem["badge"] }),
          ...(draft.imageUrl && { imageUrl: draft.imageUrl }),
          ...(draft.supplierId && { supplierId: draft.supplierId }),
          ...(cleaned.discountPrice != null && { discountPrice: cleaned.discountPrice }),
          ...(cleaned.discountEndsAt && { discountEndsAt: cleaned.discountEndsAt }),
          ...(cleaned.variants.length > 0 && { variants: cleaned.variants }),
        });
      }
      if (shouldNotify) {
        // خصم على صنف جديد أهم من كونه صنف جديد بس — إشعار واحد بس أوضح.
        notifyDiscount({
          itemName: draft.name,
          supplierName: suppliers.find((s) => s.id === draft.supplierId)?.name,
          badge: draft.badge || undefined,
          discountPercent: newDiscountPercent,
          discountedPrice: notifyDiscountedPrice,
          currency,
          imageUrl: draft.imageUrl || undefined,
        });
      } else if (!item) {
        notifyNewItem({
          itemName: draft.name,
          supplierName: suppliers.find((s) => s.id === draft.supplierId)?.name,
          badge: draft.badge || undefined,
          price: notifyPriceFields.price,
          currency,
          imageUrl: draft.imageUrl || undefined,
        });
      }
      onClose();
    } catch {
      window.alert("حصل خطأ أثناء الحفظ، حاول تاني");
    } finally {
      setSaving(false);
    }
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
