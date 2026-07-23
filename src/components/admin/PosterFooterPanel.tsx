"use client";

import { useEffect, useState } from "react";
import { subscribePosterFooter, savePosterFooter } from "@/lib/firestore";
import { DEFAULT_POSTER_FOOTER, type PosterFooterInfo } from "@/types/menu";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

function PosterFooterForm({ footer }: { footer: PosterFooterInfo }) {
  const [address, setAddress] = useState(footer.address);
  const [whatsapp, setWhatsapp] = useState(footer.whatsapp);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await savePosterFooter({ address, whatsapp });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div>
        <label className={labelClass}>عنوان المحل</label>
        <input
          className={inputClass}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="مثال: القاهرة، مدينة نصر، شارع عباس العقاد"
        />
      </div>
      <div>
        <label className={labelClass}>رقم الواتساب للتواصل</label>
        <input
          className={inputClass}
          dir="ltr"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="01xxxxxxxxx"
        />
      </div>
      <div className="flex items-center gap-3">
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

export default function PosterFooterPanel() {
  const [footer, setFooter] = useState<PosterFooterInfo | null | undefined>(undefined);

  useEffect(() => subscribePosterFooter(setFooter), []);

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">فوتر صورة المنيو</h2>
      <p className="mt-1 text-xs text-muted">
        العنوان ورقم الواتساب اللي بيظهروا أسفل صورة المنيو القابلة للتحميل من صفحة /menu.
      </p>

      {footer !== undefined && (
        <PosterFooterForm footer={footer ?? DEFAULT_POSTER_FOOTER} key={footer ? "ready" : "empty"} />
      )}
    </div>
  );
}
