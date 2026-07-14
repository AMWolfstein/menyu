"use client";

import type { Restaurant, SimpleListItem } from "@/types/menu";
import type { CheckoutInfo } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export default function CheckoutForm({
  restaurant,
  branches,
  deliveryZones,
  paymentMethods,
  value,
  onChange,
}: {
  restaurant: Restaurant;
  branches: SimpleListItem[];
  deliveryZones: SimpleListItem[];
  paymentMethods: SimpleListItem[];
  value: CheckoutInfo;
  onChange: (info: CheckoutInfo) => void;
}) {
  const set = <K extends keyof CheckoutInfo>(key: K, val: CheckoutInfo[K]) =>
    onChange({ ...value, [key]: val });

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      <h3 className="font-display text-sm font-bold text-cream">بيانات الطلب</h3>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set("orderType", "pickup")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            value.orderType === "pickup"
              ? "border-gold bg-gold font-bold text-base"
              : "border-line text-muted"
          }`}
        >
          استلام من الفرع
        </button>
        <button
          type="button"
          onClick={() => set("orderType", "delivery")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            value.orderType === "delivery"
              ? "border-gold bg-gold font-bold text-base"
              : "border-line text-muted"
          }`}
        >
          توصيل
        </button>
      </div>

      {restaurant.branchesEnabled && branches.length > 0 && (
        <div>
          <label className={labelClass}>الفرع</label>
          <select
            className={inputClass}
            value={value.branchId}
            onChange={(e) => set("branchId", e.target.value)}
          >
            <option value="">اختر الفرع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.orderType === "delivery" && deliveryZones.length > 0 && (
        <div>
          <label className={labelClass}>المنطقة</label>
          <select
            className={inputClass}
            value={value.zoneId}
            onChange={(e) => set("zoneId", e.target.value)}
          >
            <option value="">اختر المنطقة</option>
            {deliveryZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>الاسم الكامل</label>
        <input
          className={inputClass}
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="اكتب اسمك"
        />
      </div>

      <div>
        <label className={labelClass}>رقم الهاتف</label>
        <input
          className={inputClass}
          dir="ltr"
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="اكتب رقم الهاتف"
        />
      </div>

      {value.orderType === "delivery" && (
        <div>
          <label className={labelClass}>العنوان</label>
          <input
            className={inputClass}
            value={value.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="اكتب عنوانك بالتفصيل"
          />
        </div>
      )}

      {paymentMethods.length > 0 && (
        <div>
          <label className={labelClass}>طريقة الدفع</label>
          <select
            className={inputClass}
            value={value.paymentMethodId}
            onChange={(e) => set("paymentMethodId", e.target.value)}
          >
            <option value="">اختر طريقة الدفع</option>
            {paymentMethods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>ملاحظات الطلب</label>
        <textarea
          className={inputClass}
          rows={2}
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="أي ملاحظات إضافية..."
        />
      </div>
    </div>
  );
}
