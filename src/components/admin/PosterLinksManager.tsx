"use client";

import { useState } from "react";
import { addPosterLink, removePosterLink, updatePosterLink } from "@/lib/firestore";
import { usePosterLinks } from "@/hooks/usePosterLinks";
import type { PosterLink, PosterLinkPlatform } from "@/types/menu";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

const PLATFORM_LABELS: Record<PosterLinkPlatform, string> = {
  whatsapp: "واتساب",
  facebook: "فيسبوك",
  instagram: "انستغرام",
  tiktok: "تيك توك",
  phone: "تليفون",
  location: "الموقع",
};

const PLATFORMS = Object.keys(PLATFORM_LABELS) as PosterLinkPlatform[];

export default function PosterLinksManager() {
  const { links } = usePosterLinks();
  const [platform, setPlatform] = useState<PosterLinkPlatform>("whatsapp");
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<PosterLinkPlatform>("whatsapp");
  const [editLabel, setEditLabel] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    await addPosterLink({ platform, label, order: links.length });
    setLabel("");
  };

  const startEdit = (link: PosterLink) => {
    setEditingId(link.id);
    setEditPlatform(link.platform);
    setEditLabel(link.label);
  };

  const saveEdit = async (id: string) => {
    await updatePosterLink(id, { platform: editPlatform, label: editLabel });
    setEditingId(null);
  };

  const handleDelete = async (link: PosterLink) => {
    if (!window.confirm(`حذف "${link.label}"؟`)) return;
    await removePosterLink(link.id);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">روابط صور المشاركة</h2>
      <p className="mt-1 text-xs text-muted">
        بتظهر في تذييل صور المنيو للمشاركة (/menu) بدل رقم الهاتف الثابت — أيقونة وجمبها نص، زي
        أيقونة واتساب ورقمك، أو أيقونة فيسبوك واسم صفحتك.
      </p>

      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-base/40 px-3 py-2"
          >
            {editingId === link.id ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <select
                  className={inputClass}
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value as PosterLinkPlatform)}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_LABELS[p]}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="النص اللي هيظهر جمب الأيقونة"
                />
                <button
                  onClick={() => saveEdit(link.id)}
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
            ) : (
              <>
                <span className="text-sm text-cream">
                  <span className="text-gold">{PLATFORM_LABELS[link.platform]}</span> —{" "}
                  {link.label}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => startEdit(link)}
                    className="text-gold hover:text-gold-soft"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(link)}
                    className="text-chili hover:opacity-80"
                  >
                    حذف
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {links.length === 0 && <li className="text-sm text-muted">لا توجد روابط بعد.</li>}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-center gap-2">
        <select
          className={inputClass}
          value={platform}
          onChange={(e) => setPlatform(e.target.value as PosterLinkPlatform)}
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder="مثال: 01098669280 أو اسم صفحة الفيسبوك"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft"
        >
          إضافة
        </button>
      </form>
    </div>
  );
}
