"use client";

import { useState } from "react";
import type { SimpleListItem } from "@/types/menu";

const inputClass =
  "rounded-lg border border-line bg-base/60 px-3 py-2 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none";

type SimpleListApi = {
  add: (name: string, order: number) => Promise<void>;
  update: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export default function SimpleListManager({
  title,
  items,
  api,
}: {
  title: string;
  items: SimpleListItem[];
  api: SimpleListApi;
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.add(name, items.length);
    setName("");
  };

  const startEdit = (item: SimpleListItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = async (id: string) => {
    await api.update(id, editName);
    setEditingId(null);
  };

  const handleDelete = async (item: SimpleListItem) => {
    if (!window.confirm(`حذف "${item.name}"؟`)) return;
    await api.remove(item.id);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">{title}</h2>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-base/40 px-3 py-2"
          >
            {editingId === item.id ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <input
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button
                  onClick={() => saveEdit(item.id)}
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
                <span className="text-sm text-cream">{item.name}</span>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => startEdit(item)} className="text-gold hover:text-gold-soft">
                    تعديل
                  </button>
                  <button onClick={() => handleDelete(item)} className="text-chili hover:opacity-80">
                    حذف
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted">لا توجد عناصر بعد.</li>}
      </ul>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          className={inputClass}
          placeholder="اسم جديد"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
