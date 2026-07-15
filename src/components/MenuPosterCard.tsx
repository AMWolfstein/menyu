"use client";

import { useRef, useState } from "react";
import type { LiveMenuCategory } from "@/hooks/useMenuData";
import type { Restaurant } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import {
  isDiscountActive,
  getDiscountPercent,
  getVariantDiscountFields,
  pickCheapestVariant,
} from "@/lib/discount";

// ملاحظة: العناصر جوّا المنطقة اللي بتتحوّل لصورة (posterRef) بتستخدم inline
// styles بس، مش كلاسات Tailwind — Tailwind v4 بيولّد ألوان بصيغة lab()/oklch()
// اللي مكتبة html2canvas مش بتفهمها وبتفشل تصدّر الصورة لو استخدمناها هنا.

const COLORS = {
  navy: "#2f3c93",
  gold: "#eecf36",
  red: "#e2231a",
  dark: "#1a2035",
  muted: "#6b7690",
  gray: "#9ca3af",
  white: "#ffffff",
  line: "#e1e7f2",
};

export default function MenuPosterCard({
  category,
  restaurant,
}: {
  category: LiveMenuCategory;
  restaurant: Restaurant;
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const items = category.items.filter((item) => item.available !== false);
  if (items.length === 0) return null;

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    setError(false);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: COLORS.white,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `${restaurant.name}-${category.name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={posterRef}
        dir="rtl"
        style={{
          width: 720,
          maxWidth: "100%",
          backgroundColor: COLORS.white,
          padding: 32,
          fontFamily: "var(--font-cairo), system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.navy }}>
            {restaurant.name}
          </h1>
          <div
            style={{
              margin: "8px auto 0",
              height: 4,
              width: 64,
              borderRadius: 9999,
              backgroundColor: COLORS.gold,
            }}
          />
        </div>

        <h2
          style={{
            marginTop: 24,
            marginBottom: 0,
            borderRadius: 12,
            padding: "12px 0",
            textAlign: "center",
            fontSize: 20,
            fontWeight: 700,
            color: COLORS.white,
            backgroundColor: COLORS.navy,
          }}
        >
          {category.icon} {category.name}
        </h2>

        <ul style={{ marginTop: 20, padding: 0, listStyle: "none" }}>
          {items.map((item, index) => {
            const fields = getVariantDiscountFields(item, pickCheapestVariant(item));
            const discounted = isDiscountActive(fields);
            const percent = getDiscountPercent(fields);
            return (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: index === 0 ? "none" : `1px solid ${COLORS.line}`,
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.dark }}>
                  {item.name}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {discounted && (
                    <span
                      style={{
                        borderRadius: 9999,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: COLORS.white,
                        backgroundColor: COLORS.red,
                      }}
                    >
                      خصم {percent}%
                    </span>
                  )}
                  {discounted && (
                    <span
                      style={{ fontSize: 12, color: COLORS.gray, textDecoration: "line-through" }}
                    >
                      {formatPrice(fields.price, restaurant.currency)}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: discounted ? COLORS.red : COLORS.navy,
                    }}
                  >
                    {formatPrice(discounted ? fields.discountPrice! : fields.price, restaurant.currency)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        {restaurant.phone && (
          <p
            dir="ltr"
            style={{ marginTop: 24, marginBottom: 0, textAlign: "center", fontSize: 12, color: COLORS.muted }}
          >
            {restaurant.phone}
          </p>
        )}
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
      >
        {downloading ? "جارٍ التجهيز..." : "تحميل كصورة"}
      </button>
      {error && <p className="text-xs text-chili">فشل إنشاء الصورة، حاول تاني</p>}
    </div>
  );
}
