"use client";

import { useState } from "react";
import { updateRestaurant } from "@/lib/firestore";
import type { Restaurant } from "@/types/menu";
import ImageUploadField from "@/components/admin/ImageUploadField";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "block text-xs font-medium text-muted mb-1";

const emptyRestaurant: Restaurant = {
  name: "",
  tagline: "",
  currency: "",
  phone: "",
};

export default function RestaurantForm({ restaurant }: { restaurant: Restaurant | null }) {
  // Firestore rejects literal `undefined` field values on save, so optional
  // fields absent on older documents (e.g. imageUrl added in a later release)
  // are normalized to "" rather than left undefined.
  const [form, setForm] = useState<Restaurant>({
    ...(restaurant ?? emptyRestaurant),
    imageUrl: restaurant?.imageUrl ?? "",
    themeColor: restaurant?.themeColor ?? "#2f3c93",
    facebookUrl: restaurant?.facebookUrl ?? "",
    whatsappUrl: restaurant?.whatsappUrl ?? "",
    instagramUrl: restaurant?.instagramUrl ?? "",
    tiktokUrl: restaurant?.tiktokUrl ?? "",
    googleMapsUrl: restaurant?.googleMapsUrl ?? "",
  });
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

      <div className="mt-4">
        <ImageUploadField
          label="الشعار / الصورة"
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          folder="restaurant"
        />
      </div>

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
          <label className={labelClass}>لون التطبيق (PWA)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.themeColor ?? "#2f3c93"}
              onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-base/60 p-1"
            />
            <input
              className={inputClass}
              dir="ltr"
              value={form.themeColor ?? "#2f3c93"}
              onChange={(e) => setForm({ ...form, themeColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <h3 className="mt-6 font-display text-sm font-bold text-cream">روابط التواصل</h3>
      <p className="mt-1 text-xs text-muted">
        اتركها فاضية لو مش عايز الأيقونة تظهر في الصفحة الرئيسية.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>فيسبوك</label>
          <input
            className={inputClass}
            dir="ltr"
            placeholder="https://facebook.com/..."
            value={form.facebookUrl ?? ""}
            onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>واتساب</label>
          <input
            className={inputClass}
            dir="ltr"
            placeholder="https://wa.me/2010..."
            value={form.whatsappUrl ?? ""}
            onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>انستغرام</label>
          <input
            className={inputClass}
            dir="ltr"
            placeholder="https://instagram.com/..."
            value={form.instagramUrl ?? ""}
            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>تيك توك</label>
          <input
            className={inputClass}
            dir="ltr"
            placeholder="https://tiktok.com/@..."
            value={form.tiktokUrl ?? ""}
            onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>جوجل مابس</label>
          <input
            className={inputClass}
            dir="ltr"
            placeholder="https://maps.app.goo.gl/..."
            value={form.googleMapsUrl ?? ""}
            onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
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
