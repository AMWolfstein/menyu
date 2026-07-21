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

// اللوح ده بيتعرض كصفحة ويب عادية وبيتلقط كمان كصورة (html-to-image) بنفس
// الشكل بالظبط، فكل حاجة جوّا المنطقة الملتقطة (boardRef) لازم تبقى inline
// styles بس — نفس قاعدة MenuPosterCard.tsx القديمة (Tailwind v4 بيولّد
// ألوان lab()/oklch() مش مفهومة لمكتبات الالتقاط دي).

const COLORS = {
  bg: "#f4f8fc",
  navy: "#2f3c93",
  red: "#e2231a",
  black: "#1a2035",
  muted: "#6b7690",
  white: "#ffffff",
  line: "#e1e7f2",
};

export default function MenuBoard({
  categories,
  restaurant,
  posterLinks,
}: {
  categories: LiveMenuCategory[];
  restaurant: Restaurant;
  posterLinks: PosterLink[];
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const visibleCategories = categories
    .map((c) => ({ ...c, items: c.items.filter((i) => i.available !== false) }))
    .filter((c) => c.items.length > 0);

  if (visibleCategories.length === 0) return null;

  const handleDownload = async () => {
    if (!boardRef.current) return;
    setDownloading(true);
    setError(false);
    try {
      const logoImg = boardRef.current.querySelector("img");
      if (logoImg && !logoImg.complete) {
        await new Promise<void>((resolve) => {
          logoImg.addEventListener("load", () => resolve(), { once: true });
          logoImg.addEventListener("error", () => resolve(), { once: true });
        });
      }

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(boardRef.current, {
        backgroundColor: COLORS.bg,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${restaurant.name}-المنيو.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div
        ref={boardRef}
        dir="rtl"
        style={{
          width: "100%",
          maxWidth: 1100,
          minWidth: 0,
          backgroundColor: COLORS.bg,
          padding: "28px 20px",
          fontFamily: "var(--font-cairo), system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {restaurant.imageUrl && (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              crossOrigin="anonymous"
              style={{ height: 64, width: "auto" }}
            />
          )}
          <span
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: COLORS.red,
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            MENU
          </span>
        </div>
        {restaurant.tagline && (
          <p
            style={{
              margin: "10px 0 0",
              textAlign: "center",
              fontSize: 13,
              color: COLORS.muted,
            }}
          >
            {restaurant.tagline}
          </p>
        )}

        <div
          style={{
            marginTop: 28,
            columnWidth: 380,
            columnGap: 32,
          }}
        >
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              style={{
                breakInside: "avoid",
                marginBottom: 26,
                display: "inline-block",
                width: "100%",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  padding: "10px 16px",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: COLORS.white,
                  backgroundColor: COLORS.navy,
                  borderBottom: `3px solid ${COLORS.red}`,
                  borderRadius: "8px 8px 0 0",
                }}
              >
                {category.icon} {category.name}
              </h2>

              <ul style={{ margin: 0, padding: "6px 4px 0", listStyle: "none" }}>
                {category.items.map((item) => {
                  const variant = pickCheapestVariant(item);
                  const fields = getVariantDiscountFields(item, variant);
                  const discounted = isDiscountActive(fields);
                  const percent = getDiscountPercent(fields);
                  return (
                    <li
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: "9px 4px",
                        borderBottom: `1px dashed ${COLORS.line}`,
                      }}
                    >
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.black }}>
                        {item.name}
                        {variant && (
                          <span style={{ fontSize: 11, fontWeight: 400, color: COLORS.muted }}>
                            {" "}
                            ({variant.label})
                          </span>
                        )}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        {discounted && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: COLORS.white,
                              backgroundColor: COLORS.red,
                              borderRadius: 9999,
                              padding: "1px 6px",
                            }}
                          >
                            خصم <span dir="ltr">{percent}%</span>
                          </span>
                        )}
                        {discounted && (
                          <span
                            style={{
                              fontSize: 11,
                              color: COLORS.muted,
                              textDecoration: "line-through",
                            }}
                          >
                            {formatPrice(fields.price, restaurant.currency)}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 14.5,
                            fontWeight: 800,
                            color: discounted ? COLORS.red : COLORS.black,
                            whiteSpace: "nowrap",
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
        </div>

        <PosterFooterLinks
          links={posterLinks}
          colors={{
            navy: COLORS.navy,
            gold: "#eecf36",
            red: COLORS.red,
            dark: COLORS.black,
            muted: COLORS.muted,
            gray: "#9ca3af",
            white: COLORS.white,
            line: COLORS.line,
          }}
        />
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base font-bold text-base shadow-lg shadow-gold/20 transition-all hover:bg-gold-soft hover:shadow-xl active:scale-95 disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 3v13m0 0-4-4m4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {downloading ? "جارٍ التجهيز..." : "تحميل المنيو كصورة"}
      </button>
      {error && <p className="text-xs text-chili">فشل إنشاء الصورة، حاول تاني</p>}
    </div>
  );
}
