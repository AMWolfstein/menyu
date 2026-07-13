"use client";

import { useState } from "react";
import { updateRestaurant } from "@/lib/firestore";
import type { Restaurant } from "@/types/menu";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "block text-xs font-medium text-muted mb-1";

const emptyRestaurant: Restaurant = {
  name: "",
  tagline: "",
  currency: "",
  phone: "",
  address: "",
  hours: "",
  instagram: "",
};

export default function RestaurantForm({ restaurant }: { restaurant: Restaurant | null }) {
  const [form, setForm] = useState<Restaurant>(restaurant ?? emptyRestaurant);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await updateRestaurant(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-line bg-surface/60 p-5"
    >
      <h2 className="font-display text-lg font-bold text-cream">معلومات المطعم</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>الاسم</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelClass}>العملة</label>
          <input
            className={inputClass}
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>الوصف المختصر</label>
          <input
            className={inputClass}
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>الهاتف</label>
          <input
            className={inputClass}
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>انستغرام</label>
          <input
            className={inputClass}
            dir="ltr"
            value={form.instagram ?? ""}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>العنوان</label>
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>ساعات العمل</label>
          <input
            className={inputClass}
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        {saved && <span className="text-xs text-gold-soft">تم الحفظ ✓</span>}
      </div>
    </form>
  );
}
