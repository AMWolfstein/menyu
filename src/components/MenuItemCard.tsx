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

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        isBestSeller
          ? "border-highlight bg-highlight/5 ring-2 ring-highlight/50"
          : "border-line bg-surface"
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
          <span className="absolute start-2 top-2 z-10 rounded-full bg-chili px-2 py-1 text-xs font-bold text-white shadow">
            خصم <span dir="ltr">{discountPercent}%</span>
          </span>
        )}
        {item.badge && (
          <span
            className={`absolute end-2 top-2 z-10 rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-sm ${badgeStyles[item.badge]}`}
          >
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-cream">
          {item.name}
          {item.supplierName && (
            <button
              type="button"
              onClick={() => item.supplierId && onSupplierClick?.(item.supplierId, item.supplierName!)}
              className="ms-1.5 text-xs font-normal text-muted hover:text-gold hover:underline"
            >
              ({item.supplierName})
            </button>
          )}
        </h3>

        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
          {item.description}
        </p>

        <div className="mt-4 flex flex-col gap-3">
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
              <span className="text-xs text-muted line-through">
                {formatPrice(basePrice, currency)}
              </span>
            )}
            <span className="font-display text-lg font-extrabold text-cream">
              {formatPrice(payablePrice, currency)}
            </span>
          </div>

          {outOfStock && qtyInCart === 0 ? (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-line px-3 py-2.5 text-sm font-bold text-muted"
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
              className="w-full rounded-lg bg-gold px-3 py-2.5 text-sm font-bold text-base transition-all duration-200 hover:bg-gold-soft active:scale-95"
            >
              + أضف
            </button>
          ) : (
            <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-gold/40">
              <button
                onClick={() => setQty(cartLineId, qtyInCart - 1)}
                className="flex-1 py-2.5 text-gold transition-all duration-200 hover:text-gold-soft active:scale-95"
                aria-label="إنقاص الكمية"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm text-cream">{qtyInCart}</span>
              <button
                onClick={() => !outOfStock && setQty(cartLineId, qtyInCart + 1)}
                disabled={outOfStock}
                className={`flex-1 py-2.5 transition-all duration-200 active:scale-95 ${
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
