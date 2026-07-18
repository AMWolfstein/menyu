"use client";

import { useState } from "react";
import Image from "next/image";
import type { Timestamp } from "firebase/firestore";
import type { MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import { isDiscountActive, getDiscountPercent, getVariantDiscountFields } from "@/lib/discount";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { useCart } from "@/context/CartContext";

const badgeStyles: Record<NonNullable<MenuItem["badge"]>, string> = {
  "الأكثر طلباً": "bg-highlight text-base border-highlight",
  جديد: "bg-emerald-600 text-white border-emerald-600",
  عادي: "bg-slate-600 text-white border-slate-600",
  نباتي: "bg-green-600 text-white border-green-600",
  حار: "bg-chili text-white border-chili",
};

const plusButtonClass =
  "flex w-full items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-3 text-sm font-bold text-base transition-all duration-200 hover:bg-gold-soft active:scale-95";

export default function MenuItemCard({
  item,
  currency,
  onSupplierClick,
  logoUrl,
  isBestSeller,
}: {
  item: MenuItem & { supplierName?: string; discountEndsAt?: Timestamp };
  currency: string;
  onSupplierClick?: (supplierId: string, supplierName: string) => void;
  logoUrl?: string;
  isBestSeller?: boolean;
}) {
  const { items, addItem, setQty } = useCart();

  const variants = item.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? "");
  const selectedVariant = hasVariants
    ? (variants.find((v) => v.id === selectedVariantId) ?? variants[0])
    : null;

  const cartLineId = selectedVariant ? `${item.id}-${selectedVariant.id}` : item.id;
  const qtyInCart = items.find((i) => i.id === cartLineId)?.qty ?? 0;

  const discountFields = getVariantDiscountFields(item, selectedVariant ?? undefined);
  const hasDiscount = isDiscountActive(discountFields);
  const discountPercent = getDiscountPercent(discountFields);
  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const payablePrice = hasDiscount
    ? Math.round(basePrice * (1 - discountPercent / 100))
    : basePrice;
  const outOfStock = item.available === false;
  // لو الوصف نفس نص البادج بالظبط (زي "حار" فوق الصورة وتحت المورد كمان)،
  // بيبقى تكرار بلا فايدة — بنخفيه بدل ما يتعرض مرتين.
  const showDescription =
    item.description && item.description.trim().toLowerCase() !== item.badge?.trim().toLowerCase();

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isBestSeller
          ? "border-highlight/50 shadow-[0_10px_28px_-10px_rgba(238,207,54,0.5)]"
          : "border-line"
      }`}
    >
      <div className="relative aspect-square w-full shrink-0 bg-surface-2">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className={`object-cover ${outOfStock ? "grayscale" : ""}`}
          />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" logoUrl={logoUrl} />
        )}
        {outOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-cream/50">
            <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-white shadow">
              نفذ مؤقتًا
            </span>
          </div>
        )}
        {hasDiscount && (
          <span className="absolute start-2 top-2 z-10 rounded-full bg-chili px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            خصم <span dir="ltr">{discountPercent}%</span>
          </span>
        )}
        {isBestSeller ? (
          <span className="absolute end-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-highlight to-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
            الأكثر مبيعاً <span aria-hidden>🔥</span>
          </span>
        ) : (
          item.badge && (
            <span
              className={`absolute end-2 top-2 z-10 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm ${badgeStyles[item.badge]}`}
            >
              {item.badge}
            </span>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1 space-y-1">
          <h3 className="font-display text-base font-bold leading-snug text-cream">{item.name}</h3>
          {item.supplierName && (
            <button
              type="button"
              onClick={() => item.supplierId && onSupplierClick?.(item.supplierId, item.supplierName!)}
              className="block text-start text-sm text-muted hover:text-gold hover:underline"
            >
              {item.supplierName}
            </button>
          )}

          {showDescription && (
            <p className="text-sm leading-relaxed text-muted">{item.description}</p>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {hasVariants && (
            <div className="flex flex-wrap gap-1.5">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    v.id === selectedVariant?.id
                      ? "border-gold bg-gold text-base"
                      : "border-line text-muted hover:border-gold/40 hover:text-cream"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-sm tabular-nums text-muted line-through">
                {formatPrice(basePrice, currency)}
              </span>
            )}
            <span
              className={`font-display text-lg font-extrabold tabular-nums ${
                hasDiscount ? "text-chili" : "text-cream"
              }`}
            >
              {formatPrice(payablePrice, currency)}
            </span>
          </div>

          {outOfStock && qtyInCart === 0 ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-full bg-line px-4 py-3 text-sm font-bold text-muted"
            >
              نفذ مؤقتًا
            </button>
          ) : qtyInCart === 0 ? (
            <button
              onClick={() =>
                addItem({
                  id: cartLineId,
                  itemId: item.id,
                  name: item.name,
                  variantLabel: selectedVariant?.label,
                  price: payablePrice,
                  imageUrl: item.imageUrl,
                  ...(hasDiscount && { originalPrice: basePrice }),
                })
              }
              className={plusButtonClass}
            >
              <span aria-hidden className="text-base leading-none">+</span>
              <span>أضف</span>
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-1 rounded-full border border-gold/40">
              <button
                onClick={() => setQty(cartLineId, qtyInCart - 1)}
                className="flex-1 py-3 text-gold transition-all duration-200 hover:text-gold-soft active:scale-95"
                aria-label="إنقاص الكمية"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm text-cream">{qtyInCart}</span>
              <button
                onClick={() => !outOfStock && setQty(cartLineId, qtyInCart + 1)}
                disabled={outOfStock}
                className={`flex-1 py-3 transition-all duration-200 active:scale-95 ${
                  outOfStock ? "cursor-not-allowed text-line" : "text-gold hover:text-gold-soft"
                }`}
                aria-label="زيادة الكمية"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
