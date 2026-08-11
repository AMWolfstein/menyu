"use client";

import { useRef, useState } from "react";
import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";
import type { MenuItemVariant, PosterFooterInfo, Restaurant } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import { isDiscountActive, getDiscountPercent, getVariantDiscountFields } from "@/lib/discount";

// اللوح ده بيتعرض كصفحة ويب عادية وبيتلقط كمان كصورة (html-to-image) بنفس
// الشكل بالظبط، فكل حاجة جوّا المنطقة الملتقطة لازم تبقى inline styles بس.
// الخلفية (public/poster-bg.jpg) مرسومة على الـ canvas مباشرة (مش عن طريق
// html-to-image) — أصل من نفس الأصل (same-origin) فمفيش مشكلة crossOrigin،
// وده بيوفّر التقاط منفصل ليها. المحتوى (الأعمدة + الفوتر) بيتلقط بشفافية
// فوقها. أبعاد اللوح مطابقة لمقاسات الخلفية بالظبط (768×1376) والمنطقة
// الفاضية فيها (مقاسة يدويًا من الصورة) هي اللي بيتحط جواها المنيو.

const COLORS = {
  red: "#e2231a",
  black: "#1a2035",
  whatsapp: "#16a34a",
};

const BADGE_LABEL_COLOR: Record<string, string> = {
  عادي: COLORS.black,
  نباتي: "#16a34a",
  حار: COLORS.red,
};

const BOARD_WIDTH = 768;
const BOARD_HEIGHT = 1376;
const BG_IMAGE_SRC = "/poster-bg.jpg";
// إحداثيات المنطقة الفاضية في الخلفية (اتقاست يدويًا من الصورة نفسها).
const CONTENT_TOP = 375;
const CONTENT_HEIGHT = 690;
const CONTENT_SIDE_PADDING = 24;
const FOOTER_TOP = 1108;
const FOOTER_SIDE_PADDING = 130;
const COLUMN_COUNT = 2;
// عدد الأسطر (صنف/وزن) المستهدف لكل عمود — اتحسب تجريبيًا بناءً على معاينة
// حقيقية بنفس الخط والمساحة، مش قاعدة صارمة. الهيدر بياخد حمل سطر واحد.
const TARGET_ROWS_PER_COLUMN = 21;
// مكان ترقيم الصفحة أسفل قطعة التلج، تحت الفوتر مباشرة.
const PAGE_NUMBER_TOP = 1250;

type BoardItem = LiveMenuItem & { supplierName?: string };
type BoardCategory = Omit<LiveMenuCategory, "items"> & { items: BoardItem[] };
type BoardRow = { item: BoardItem; variant?: MenuItemVariant };
// "قطعة" فئة داخل عمود — ممكن الفئة تتقسّم على أكتر من عمود لو أصنافها
// (بعد توسيع الأوزان) أكتر من محتوى عمود واحد؛ continued بتتحط على أول
// قطعة مكمّلة لفئة بدأت في عمود سابق.
type CategorySegment = { category: BoardCategory; rows: BoardRow[]; continued: boolean };

// كل وزن (variant) في الصنف بيتعرض كسطر مستقل في البوستر (سعره وخصمه
// مستقلين عن باقي الأوزان).
function expandRows(item: BoardItem): BoardRow[] {
  if (item.variants && item.variants.length > 0) {
    return item.variants.map((variant) => ({ item, variant }));
  }
  return [{ item }];
}

// بيوزّع الفئات على أعمدة بالتدفّق (flow) بالترتيب المُدخل — بيملأ العمود
// الحالي لحد ما يوصل لحمله المستهدف قبل ما يبدأ عمود جديد، ولو فئة عندها
// أسطر أكتر من سعة عمود واحد (زي فئة فيها عشرات الأصناف بأوزان مختلفة)
// بتتقسّم على أكتر من عمود بدل ما تتحشر كلها في عمود واحد وتتقصّ من غير
// ما حد يلاحظ (overflow: hidden على منطقة المحتوى). عدد الأعمدة/الصفحات
// مش محسوب مقدّمًا — بيكبر لحد ما كل الأصناف تتحط في مكان.
function distributeIntoPages(categories: BoardCategory[]): CategorySegment[][][] {
  const columns: CategorySegment[][] = [[]];
  let columnLoad = 0;

  for (const category of categories) {
    let rows = category.items.flatMap(expandRows);
    let continued = false;
    while (rows.length > 0) {
      if (columnLoad > 0 && columnLoad >= TARGET_ROWS_PER_COLUMN) {
        columns.push([]);
        columnLoad = 0;
      }
      const capacity = Math.max(1, TARGET_ROWS_PER_COLUMN - columnLoad - 1); // 1 = حمل الهيدر
      const take = Math.min(capacity, rows.length);
      columns[columns.length - 1].push({ category, rows: rows.slice(0, take), continued });
      columnLoad += take + 1;
      rows = rows.slice(take);
      continued = true;
      if (rows.length > 0) {
        columns.push([]);
        columnLoad = 0;
      }
    }
  }

  const pages: CategorySegment[][][] = [];
  for (let i = 0; i < columns.length; i += COLUMN_COUNT) {
    pages.push(columns.slice(i, i + COLUMN_COUNT));
  }
  return pages;
}

function ItemRow({
  item,
  variant,
  restaurant,
}: {
  item: BoardItem;
  variant?: MenuItemVariant;
  restaurant: Restaurant;
}) {
  const fields = getVariantDiscountFields(item, variant);
  const discounted = isDiscountActive(fields);
  const percent = getDiscountPercent(fields);

  const details = [variant?.label, item.supplierName?.trim(), item.badge !== "عادي" ? item.badge : undefined]
    .filter(Boolean)
    .join(" - ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 6,
        padding: "5px 0",
      }}
    >
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 700,
          color: COLORS.black,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.name}
        {details && (
          <span style={{ color: item.badge ? (BADGE_LABEL_COLOR[item.badge] ?? COLORS.black) : COLORS.black }}>
            {" "}
            - {details}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, flexShrink: 0 }}>
        {discounted && (
          <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.red }}>
            (خصم <span dir="ltr">{percent}%</span>)
          </span>
        )}
        <span
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            color: discounted ? COLORS.red : COLORS.black,
            whiteSpace: "nowrap",
          }}
        >
          {formatPrice(discounted ? fields.discountPrice! : fields.price, restaurant.currency)}
        </span>
      </div>
    </div>
  );
}

function PosterPage({
  pageRef,
  columns,
  restaurant,
  posterFooter,
  pageIndex,
  totalPages,
}: {
  pageRef: (el: HTMLDivElement | null) => void;
  columns: CategorySegment[][];
  restaurant: Restaurant;
  posterFooter: PosterFooterInfo;
  pageIndex: number;
  totalPages: number;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div
        ref={pageRef}
        dir="rtl"
        style={{
          position: "relative",
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          margin: "0 auto",
          fontFamily: "var(--font-cairo), system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: CONTENT_TOP,
            left: CONTENT_SIDE_PADDING,
            right: CONTENT_SIDE_PADDING,
            height: CONTENT_HEIGHT,
            display: "flex",
            gap: 18,
            overflow: "hidden",
          }}
        >
          {columns.map((segments, colIndex) => (
            <div
              key={colIndex}
              data-capture-piece="column"
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
            >
              {segments.map((segment, segIndex) => (
                <div key={`${segment.category.id}-${segIndex}`} style={{ marginBottom: 4 }}>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 17,
                      fontWeight: 900,
                      color: COLORS.black,
                      borderBottom: `3px solid ${COLORS.red}`,
                      paddingBottom: 2,
                      marginTop: 9,
                      marginBottom: 8,
                    }}
                  >
                    {segment.category.icon} {segment.category.name}
                    {segment.continued && " (تابع)"}
                  </div>
                  {segment.rows.map(({ item, variant }) => (
                    <ItemRow
                      key={variant ? variant.id : item.id}
                      item={item}
                      variant={variant}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {(posterFooter.address || posterFooter.whatsapp) && (
          <div
            style={{
              position: "absolute",
              top: FOOTER_TOP,
              left: FOOTER_SIDE_PADDING,
              right: FOOTER_SIDE_PADDING,
              textAlign: "center",
            }}
          >
            {/* html-to-image بيفشل يلتقط نص عنصر position:absolute مباشرة —
              بيطلّع صورة فاضية من غير أي error (لقيناها بعد تشخيص مباشر).
              الحل: data-capture-piece بيتحط على طفل عادي (static) جوّا
              الغلاف اللي عليه الـ position:absolute، مش على الغلاف نفسه —
              نفس الباترن اللي الأعمدة شغالة بيه أصلاً (الغلاف اللي فيه
              الأعمدة absolute، بس كل عمود جواه نفسه flex child عادي). */}
            <div data-capture-piece="footer">
              {posterFooter.address && (
                <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.black, lineHeight: 1.3 }}>
                  📍 {posterFooter.address}
                </div>
              )}
              {posterFooter.whatsapp && (
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: COLORS.whatsapp }}>
                  📱 واتساب: <span dir="ltr">{posterFooter.whatsapp}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div
            style={{
              position: "absolute",
              top: PAGE_NUMBER_TOP,
              left: 0,
              right: 0,
              textAlign: "center",
            }}
          >
            {/* نفس باترن الفوتر: data-capture-piece على طفل static جوّا
              الغلاف absolute، عشان html-to-image يقدر يلتقطه. */}
            <div data-capture-piece="page-number" style={{ display: "inline-block" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 16px",
                  borderRadius: 999,
                  border: `1.5px solid ${COLORS.red}`,
                  background: "rgba(255,255,255,0.85)",
                  fontSize: 13,
                  fontWeight: 800,
                  color: COLORS.black,
                }}
              >
                صفحة {pageIndex + 1} من {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

let cachedBgImage: HTMLImageElement | null = null;
function loadBackgroundImage(): Promise<HTMLImageElement> {
  if (cachedBgImage && cachedBgImage.complete) return Promise.resolve(cachedBgImage);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cachedBgImage = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error("background image failed to load"));
    img.src = BG_IMAGE_SRC;
  });
}

async function capturePageToDataUrl(pageEl: HTMLElement): Promise<string> {
  const scale = 2;
  const { toPng } = await import("html-to-image");
  const pageRect = pageEl.getBoundingClientRect();
  const pieceEls = Array.from(pageEl.querySelectorAll<HTMLElement>("[data-capture-piece]"));

  // بنلتقط القطع واحدة ورا التانية (مش بالتوازي) — html-to-image مش آمن مع
  // نداءات متزامنة، ومش قادر يترجم صح أكتر من طفل معقّد جنب بعض في نفس
  // الالتقاط (نفس السبب اللي منعنا نلتقط الأعمدة كلها بضربة واحدة).
  const pieces: { img: HTMLImageElement; x: number; y: number; width: number; height: number }[] = [];
  for (const el of pieceEls) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const dataUrl = await toPng(el, { pixelRatio: scale, cacheBust: true });
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("piece image failed to load"));
      img.src = dataUrl;
    });
    pieces.push({
      img,
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  const bgImg = await loadBackgroundImage();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pageRect.width * scale);
  canvas.height = Math.round(pageRect.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas context unavailable");
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  for (const piece of pieces) {
    ctx.drawImage(
      piece.img,
      Math.round(piece.x * scale),
      Math.round(piece.y * scale),
      Math.round(piece.width * scale),
      Math.round(piece.height * scale)
    );
  }
  return canvas.toDataURL("image/png");
}

export default function MenuBoard({
  categories,
  restaurant,
  posterFooter,
}: {
  categories: BoardCategory[];
  restaurant: Restaurant;
  posterFooter: PosterFooterInfo;
}) {
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);

  const visibleCategories = categories
    .map((c) => ({ ...c, items: c.items.filter((i) => i.available !== false) }))
    .filter((c) => c.items.length > 0);

  if (visibleCategories.length === 0) return null;

  const pages = distributeIntoPages(visibleCategories);
  const hasMultiplePages = pages.length > 1;

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    setActivePage(clamped);
    pageRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError(false);
    try {
      await loadBackgroundImage();
      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageEl = pageRefs.current[i];
        if (!pageEl) continue;
        const dataUrl = await capturePageToDataUrl(pageEl);
        const link = document.createElement("a");
        const suffix = hasMultiplePages ? `-${i + 1}` : "";
        link.download = `${restaurant.name}-المنيو${suffix}.png`;
        link.href = dataUrl;
        link.click();
        if (i < pageRefs.current.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    } catch {
      setError(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {hasMultiplePages && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToPage(activePage - 1)}
            disabled={activePage === 0}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-cream transition-colors hover:border-gold/40 disabled:opacity-30"
          >
            السابقة ←
          </button>
          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                aria-label={`صفحة ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === activePage ? "bg-gold" : "bg-line"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goToPage(activePage + 1)}
            disabled={activePage === pages.length - 1}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-cream transition-colors hover:border-gold/40 disabled:opacity-30"
          >
            → التالية
          </button>
        </div>
      )}

      <div className="flex w-full flex-col gap-10">
        {pages.map((columns, i) => (
          <PosterPage
            key={i}
            pageRef={(el) => {
              pageRefs.current[i] = el;
            }}
            columns={columns}
            restaurant={restaurant}
            posterFooter={posterFooter}
            pageIndex={i}
            totalPages={pages.length}
          />
        ))}
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
        {downloading
          ? "جارٍ التجهيز..."
          : hasMultiplePages
            ? `تحميل كل الصفحات (${pages.length})`
            : "تحميل المنيو كصورة"}
      </button>
      {error && <p className="text-xs text-chili">فشل إنشاء الصورة، حاول تاني</p>}
    </div>
  );
}
