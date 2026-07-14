"use client";

import { useEffect, useRef } from "react";

type NavItem = { id: string; name: string; icon?: string };

export default function CategoryNav({
  items,
  active,
  onSelect,
}: {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);

  // إبقاء الزر النشط ظاهراً داخل الشريط الأفقي
  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-base/85 backdrop-blur">
      <div
        ref={navRef}
        className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              data-cat={it.id}
              onClick={() => onSelect(it.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gold bg-gold text-base"
                  : "border-line bg-surface text-muted hover:border-gold/40 hover:text-cream"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {it.icon && <span>{it.icon}</span>}
                <span>{it.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
