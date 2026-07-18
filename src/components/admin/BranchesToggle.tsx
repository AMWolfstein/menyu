"use client";

import { useState } from "react";
import { updateRestaurant } from "@/lib/firestore";
import type { Restaurant } from "@/types/menu";

export default function BranchesToggle({ restaurant }: { restaurant: Restaurant | null }) {
  const [enabled, setEnabled] = useState(restaurant?.branchesEnabled ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await updateRestaurant({ branchesEnabled: enabled });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">نظام الفروع</h2>
      <label className="mt-3 flex items-center gap-2 text-sm text-cream">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        تفعيل نظام الفروع (يظهر اختيار الفرع للزبون عند الطلب)
      </label>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        {saved && <span className="text-xs text-gold-soft">تم الحفظ ✓</span>}
      </div>
    </div>
  );
}
