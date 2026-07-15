"use client";

import { useState } from "react";
import { addCategory, updateCategory } from "@/lib/firestore";
import type { LiveMenuCategory } from "@/hooks/useMenuData";
import Modal from "@/components/admin/Modal";

const inputClass =
  "w-full rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export default function CategoryFormModal({
  editing,
  order,
  onClose,
}: {
  editing: LiveMenuCategory | null;
  order: number;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    if (editing) {
      await updateCategory(editing.id, { name, icon });
    } else {
      await addCategory({ name, icon, order });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal title={editing ? "تعديل الفئة" : "إضافة فئة جديدة"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className={labelClass}>اسم الفئة</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass}>رمز توضيحي (إيموجي)</label>
          <input
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🍗"
          />
        </div>
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
            {saving ? "جارٍ الحفظ..." : editing ? "حفظ" : "إضافة"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
