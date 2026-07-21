"use client";

import { useRef, useState } from "react";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
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
// ألوان lab()/oklch() مش مفهومة لمكتبات الالتقاط دي). عرض اللوح ثابت (مش
// نسبي) عشان الصورة الناتجة تبقى دايمًا بـ 3 أعمدة، حتى لو اتحمّلت من
// موبايل بشاشة ضيقة — المعاينة على الشاشة بتتمرر أفقيًا لو الشاشة أضيق.

const COLORS = {
  bg: "#f4f8fc",
  brand: "#2f3c93",
  red: "#e2231a",
  gold: "#eecf36",
  black: "#1a2035",
  muted: "#6b7690",
  white: "#ffffff",
  line: "#e1e7f2",
};

const BADGE_COLORS: Record<string, string> = {
  عادي: "#475569",
  نباتي: "#16a34a",
  حار: COLORS.red,
};

const BOARD_WIDTH = 1200;
const COLUMN_COUNT = 3;

type BoardItem = LiveMenuItem & { supplierName?: string };
type BoardCategory = Omit<LiveMenuCategory, "items"> & { items: BoardItem[] };

// html-to-image بيفشل يترجم CSS multi-column (column-count) صح، فبدل ما
// نعتمد عليه بنوزّع الفئات يدويًا على أعمدة (flexbox عادي) حسب عدد أصنافها
// — كل فئة بتتحط في أقصر عمود لحد اللحظة دي، عشان الأعمدة تفضل متوازنة.
function distributeIntoColumns(
  categories: BoardCategory[],
  columnCount: number
): BoardCategory[][] {
  const columns: BoardCategory[][] = Array.from({ length: columnCount }, () => []);
  const columnLoad = new Array(columnCount).fill(0);
  for (const category of categories) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (columnLoad[i] < columnLoad[shortest]) shortest = i;
    }
    columns[shortest].push(category);
    columnLoad[shortest] += category.items.length + 1;
  }
  return columns;
}

function CategoryCard({
  category,
  restaurant,
}: {
  category: BoardCategory;
  restaurant: Restaurant;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          padding: "10px 14px",
          textAlign: "center",
          fontSize: 15,
          fontWeight: 800,
          color: COLORS.white,
          backgroundColor: COLORS.brand,
          borderBottom: `3px solid ${COLORS.gold}`,
          borderRadius: "10px 10px 0 0",
        }}
      >
        {category.icon} {category.name}
      </div>

      <div
        style={{
          border: `1px solid ${COLORS.line}`,
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          padding: "4px 12px",
        }}
      >
        {category.items.map((item) => {
          const variant = pickCheapestVariant(item);
          const fields = getVariantDiscountFields(item, variant);
          const discounted = isDiscountActive(fields);
          const percent = getDiscountPercent(fields);

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 0",
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.black }}>
                  {item.name}
                  {variant && (
                    <span style={{ fontSize: 10.5, fontWeight: 400, color: COLORS.muted }}>
                      {" "}
                      ({variant.label})
                    </span>
                  )}
                </div>
                {(item.supplierName || item.badge) && (
                  <div style={{ marginTop: 2, fontSize: 10.5 }}>
                    {item.supplierName && (
                      <span style={{ color: COLORS.muted }}>{item.supplierName}</span>
                    )}
                    {item.supplierName && item.badge && (
                      <span style={{ color: COLORS.muted }}> · </span>
                    )}
                    {item.badge && (
                      <span
                        style={{ fontWeight: 700, color: BADGE_COLORS[item.badge] ?? COLORS.muted }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0 }}>
                {discounted && (
                  <span
                    style={{
                      fontSize: 9,
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
                  <span style={{ fontSize: 10, color: COLORS.muted, textDecoration: "line-through" }}>
                    {formatPrice(fields.price, restaurant.currency)}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: discounted ? COLORS.red : COLORS.black,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatPrice(discounted ? fields.discountPrice! : fields.price, restaurant.currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MenuBoard({
  categories,
  restaurant,
  posterLinks,
}: {
  categories: BoardCategory[];
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

      // html-to-image بيفشل يلتقط صح لما العنصر المُلتقط عنده أكتر من طفل
      // فرعي معقّد جنب بعض (اتأكدنا إن التقاط اللوح كله بيرسم عمود واحد بس
      // ويسيب الباقي فاضي، بينما التقاط كل قطعة (الهيدر / كل عمود / الفوتر)
      // لوحده بيطلع مطابق تمامًا). فبنلتقط كل قطعة على حدة ونركّبهم بعدين
      // على canvas واحد باستخدام إحداثياتهم الحقيقية من التخطيط الحي.
      const scale = 2;
      const { toPng } = await import("html-to-image");
      const boardRect = boardRef.current.getBoundingClientRect();
      const pieceEls = Array.from(
        boardRef.current.querySelectorAll<HTMLElement>("[data-capture-piece]")
      );

      // بنلتقط القطع واحدة ورا التانية (مش بالتوازي) — html-to-image مش
      // آمن مع نداءات متزامنة (حالة داخلية مشتركة بتتلخبط لو اشتغل أكتر
      // من التقاط في نفس الوقت).
      const pieces: { img: HTMLImageElement; x: number; y: number; width: number; height: number }[] = [];
      for (const el of pieceEls) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const dataUrl = await toPng(el, {
          pixelRatio: scale,
          cacheBust: true,
          backgroundColor: COLORS.bg,
        });
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("piece image failed to load"));
          img.src = dataUrl;
        });
        pieces.push({
          img,
          x: rect.left - boardRect.left,
          y: rect.top - boardRect.top,
          width: rect.width,
          height: rect.height,
        });
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(boardRect.width * scale);
      canvas.height = Math.round(boardRect.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas context unavailable");
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const piece of pieces) {
        ctx.drawImage(
          piece.img,
          Math.round(piece.x * scale),
          Math.round(piece.y * scale),
          Math.round(piece.width * scale),
          Math.round(piece.height * scale)
        );
      }

      const link = document.createElement("a");
      link.download = `${restaurant.name}-المنيو.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full overflow-x-auto">
        <div
          ref={boardRef}
          dir="rtl"
          style={{
            width: BOARD_WIDTH,
            margin: "0 auto",
            backgroundColor: COLORS.bg,
            padding: "32px 28px",
            fontFamily: "var(--font-cairo), system-ui, sans-serif",
          }}
        >
          <div data-capture-piece="header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
              {restaurant.imageUrl && (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  crossOrigin="anonymous"
                  style={{ height: 72, width: "auto", borderRadius: 12 }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: 3,
                    color: COLORS.brand,
                    backgroundColor: COLORS.gold,
                    padding: "4px 14px",
                    borderRadius: 9999,
                  }}
                >
                  MENU
                </span>
                <span
                  style={{ marginTop: 8, fontSize: 28, fontWeight: 900, color: COLORS.brand, lineHeight: 1.2 }}
                >
                  {restaurant.name}
                </span>
              </div>
            </div>
            {restaurant.tagline && (
              <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 13, color: COLORS.muted }}>
                {restaurant.tagline}
              </p>
            )}
          </div>

          <div style={{ marginTop: 30, display: "flex", alignItems: "flex-start", gap: 24 }}>
            {distributeIntoColumns(
              visibleCategories,
              Math.min(COLUMN_COUNT, visibleCategories.length)
            ).map((columnCategories, colIndex) => (
              <div
                key={colIndex}
                data-capture-piece="column"
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
              >
                {columnCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} restaurant={restaurant} />
                ))}
              </div>
            ))}
          </div>

          <div data-capture-piece="footer">
            <PosterFooterLinks
              links={posterLinks}
              colors={{
                navy: COLORS.brand,
                gold: COLORS.gold,
                red: COLORS.red,
                dark: COLORS.black,
                muted: COLORS.muted,
                gray: "#9ca3af",
                white: COLORS.white,
                line: COLORS.line,
              }}
            />
          </div>
        </div>
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
