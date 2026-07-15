"use client";

import { useRef, useState } from "react";
import type { LiveMenuCategory } from "@/hooks/useMenuData";
import type { PosterLink, Restaurant } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import {
  isDiscountActive,
  getDiscountPercent,
  getVariantDiscountFields,
  pickCheapestVariant,
} from "@/lib/discount";
import PosterFooterLinks from "@/components/PosterFooterLinks";

// نفس ملاحظة MenuPosterCard.tsx: كل الألوان جوّا المنطقة اللي بتتحوّل لصورة
// لازم تبقى inline styles، مش كلاسات Tailwind (مشكلة توافق html2canvas مع
// صيغ الألوان الحديثة lab()/oklch() اللي Tailwind v4 بيولّدها).

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

export default function CombinedMenuPoster({
  categories,
  restaurant,
  posterLinks,
}: {
  categories: LiveMenuCategory[];
  restaurant: Restaurant;
  posterLinks: PosterLink[];
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const visibleCategories = categories
    .map((c) => ({ ...c, items: c.items.filter((i) => i.available !== false) }))
    .filter((c) => c.items.length > 0);

  if (visibleCategories.length === 0) return null;

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
      link.download = `${restaurant.name}-المنيو-كامل.png`;
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
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              crossOrigin="anonymous"
              style={{ height: 64, width: "auto", margin: "0 auto", display: "block" }}
            />
          ) : (
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.navy }}>
              {restaurant.name}
            </h1>
          )}
          {restaurant.tagline && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.muted }}>
              {restaurant.tagline}
            </p>
          )}
          <div
            style={{
              margin: "10px auto 0",
              height: 4,
              width: 64,
              borderRadius: 9999,
              backgroundColor: COLORS.gold,
            }}
          />
        </div>

        {visibleCategories.map((category) => (
          <div key={category.id} style={{ marginTop: 28 }}>
            <h2
              style={{
                margin: 0,
                borderRadius: 12,
                padding: "12px 0",
                textAlign: "center",
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.white,
                backgroundColor: COLORS.navy,
              }}
            >
              {category.icon} {category.name}
            </h2>

            <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
              {category.items.map((item, index) => {
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
                      padding: "10px 0",
                      borderTop: index === 0 ? "none" : `1px solid ${COLORS.line}`,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark }}>
                      {item.name}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {discounted && (
                        <span
                          style={{
                            borderRadius: 9999,
                            padding: "2px 8px",
                            fontSize: 10,
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
                          style={{ fontSize: 11, color: COLORS.gray, textDecoration: "line-through" }}
                        >
                          {formatPrice(fields.price, restaurant.currency)}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: discounted ? COLORS.red : COLORS.navy,
                        }}
                      >
                        {formatPrice(
                          discounted ? fields.discountPrice! : fields.price,
                          restaurant.currency
                        )}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <PosterFooterLinks links={posterLinks} colors={COLORS} />
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="rounded-lg bg-gold px-5 py-2.5 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
      >
        {downloading ? "جارٍ التجهيز..." : "تحميل المنيو كامل كصورة واحدة"}
      </button>
      {error && <p className="text-xs text-chili">فشل إنشاء الصورة، حاول تاني</p>}
    </div>
  );
}
