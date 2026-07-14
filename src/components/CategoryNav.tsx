"use client";

import { useEffect, useRef } from "react";

type NavItem = { id: string; name: string };

const ALL_ID = "all";

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
  const navItems: NavItem[] = [{ id: ALL_ID, name: "الكل" }, ...items];

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
        {navItems.map((it) => {
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
              {it.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
