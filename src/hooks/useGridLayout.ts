"use client";

import { useEffect, useState } from "react";
import { subscribeGridLayout } from "@/lib/firestore";
import { DEFAULT_GRID_LAYOUT, type GridLayoutConfig } from "@/types/layout";

const DESKTOP_BREAKPOINT = 1024; // نفس نقطة تحول Tailwind's `lg:`

function isDesktopViewport(): boolean {
  return typeof window !== "undefined" && window.innerWidth >= DESKTOP_BREAKPOINT;
}

/** بيرجع عدد الأعمدة المناسب فعليًا للعرض الحالي (موبايل/ديسكتوب)، ومتجاوب
 * تلقائيًا مع تغيير حجم الشاشة، بناءً على إعدادات لوحة التحكم. */
export function useGridLayout(): number {
  const [config, setConfig] = useState<GridLayoutConfig>(DEFAULT_GRID_LAYOUT);
  const [isDesktop, setIsDesktop] = useState(() => isDesktopViewport());

  useEffect(() => subscribeGridLayout((c) => setConfig(c ?? DEFAULT_GRID_LAYOUT)), []);

  useEffect(() => {
    const update = () => setIsDesktop(isDesktopViewport());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isDesktop ? config.desktopColumns : config.mobileColumns;
}
