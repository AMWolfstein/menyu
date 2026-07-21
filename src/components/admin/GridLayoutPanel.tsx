"use client";

import { useEffect, useState } from "react";
import { subscribeGridLayout, saveGridLayout } from "@/lib/firestore";
import { DEFAULT_GRID_LAYOUT, type GridLayoutConfig } from "@/types/layout";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

const MIN_COLUMNS = 1;
const MAX_COLUMNS = 6;

function GridLayoutForm({ config }: { config: GridLayoutConfig }) {
  const [mobileColumns, setMobileColumns] = useState(config.mobileColumns);
  const [desktopColumns, setDesktopColumns] = useState(config.desktopColumns);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await saveGridLayout({ mobileColumns, desktopColumns });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
      <div>
        <label className={labelClass}>عدد الأعمدة - موبايل</label>
        <select
          className={inputClass}
          value={mobileColumns}
          onChange={(e) => setMobileColumns(Number(e.target.value))}
        >
          {Array.from({ length: MAX_COLUMNS - MIN_COLUMNS + 1 }, (_, i) => MIN_COLUMNS + i).map(
            (n) => (
              <option key={n} value={n}>
                {n}
              </option>
            )
          )}
        </select>
      </div>

      <div>
        <label className={labelClass}>عدد الأعمدة - كمبيوتر</label>
        <select
          className={inputClass}
          value={desktopColumns}
          onChange={(e) => setDesktopColumns(Number(e.target.value))}
        >
          {Array.from({ length: MAX_COLUMNS - MIN_COLUMNS + 1 }, (_, i) => MIN_COLUMNS + i).map(
            (n) => (
              <option key={n} value={n}>
                {n}
              </option>
            )
          )}
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
      >
        {saving ? "جارٍ الحفظ..." : "حفظ"}
      </button>
      {saved && <span className="text-xs text-gold-soft">تم الحفظ ✓</span>}
    </form>
  );
}

export default function GridLayoutPanel() {
  const [config, setConfig] = useState<GridLayoutConfig | null | undefined>(undefined);

  useEffect(() => subscribeGridLayout(setConfig), []);

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">تخطيط شبكة المنتجات</h2>
      <p className="mt-1 text-xs text-muted">
        عدد كروت المنتجات في الصف الواحد بالصفحة الرئيسية — يتحدد بشكل مستقل لشاشات الموبايل
        والكمبيوتر.
      </p>

      {config !== undefined && (
        <GridLayoutForm
          config={config ?? DEFAULT_GRID_LAYOUT}
          key={config ? "ready" : "empty"}
        />
      )}
    </div>
  );
}
