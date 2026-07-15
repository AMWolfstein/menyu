"use client";

import Image from "next/image";
import type { LiveMenuItem } from "@/hooks/useMenuData";
import { formatPrice } from "@/lib/format";
import { isDiscountActive, itemHasAnyDiscount } from "@/lib/discount";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import { PencilIcon, TrashIcon, EyeIcon, EyeOffIcon } from "@/components/admin/icons";

export default function ItemCard({
  item,
  currency,
  supplierName,
  logoUrl,
  onEdit,
  onDelete,
  onToggleAvailable,
}: {
  item: LiveMenuItem;
  currency: string;
  supplierName?: string;
  logoUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailable: () => void;
}) {
  const available = item.available !== false;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3 transition-opacity ${
        available ? "" : "opacity-60"
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" logoUrl={logoUrl} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-bold ${available ? "text-cream" : "text-muted line-through"}`}
        >
          {item.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">{item.description || "—"}</p>
        <p className="mt-1 text-xs text-muted">
          {item.variants && item.variants.length > 0 ? (
            <>
              <span className="font-bold text-gold">
                من {formatPrice(Math.min(...item.variants.map((v) => v.price)), currency)}
              </span>
              {itemHasAnyDiscount(item) && <span className="text-chili"> · فيه خصم</span>}
            </>
          ) : item.discountPrice ? (
            <>
              <span className="line-through">{formatPrice(item.price, currency)}</span>{" "}
              <span className="font-bold text-chili">
                {formatPrice(item.discountPrice, currency)}
              </span>
              {!isDiscountActive(item) && <span> (منتهي)</span>}
            </>
          ) : (
            <span className="font-bold text-gold">{formatPrice(item.price, currency)}</span>
          )}
          {item.badge ? ` · ${item.badge}` : ""}
          {supplierName ? ` · ${supplierName}` : ""}
          {item.variants && item.variants.length > 0 ? ` · ${item.variants.length} أوزان` : ""}
          {item.orderCount ? ` · طُلب ${item.orderCount} مرة` : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <button
          type="button"
          onClick={onToggleAvailable}
          aria-label={available ? "إخفاء الصنف" : "إظهار الصنف"}
          title={available ? "متوفر" : "غير متوفر"}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-cream"
        >
          {available ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label="تعديل"
          className="rounded-lg p-2 text-gold transition-colors hover:bg-gold/10"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="حذف"
          className="rounded-lg p-2 text-chili transition-colors hover:bg-chili/10"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
