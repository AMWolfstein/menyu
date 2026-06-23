"use client";

import { useEffect, useRef, useState } from "react";

type NavItem = { id: string; name: string };

export default function CategoryNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(`cat-${it.id}`))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id.replace("cat-", ""));
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // إبقاء الزر النشط ظاهراً داخل الشريط الأفقي
  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>(
      `[data-cat="${active}"]`
    );
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const goTo = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  };

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
              onClick={() => goTo(it.id)}
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
