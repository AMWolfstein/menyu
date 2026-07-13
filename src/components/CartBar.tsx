"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import type { Restaurant } from "@/types/menu";

export default function CartBar({ restaurant }: { restaurant: Restaurant }) {
  const { items, itemCount, total, removeItem, setQty, clearCart } = useCart();
  const [expanded, setExpanded] = useState(false);

  if (itemCount === 0) return null;

  const whatsappUrl = buildWhatsAppOrderUrl(items, restaurant);

  const handleClear = () => {
    if (window.confirm("إفراغ السلة بالكامل؟")) clearCart();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
      {expanded && (
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-cream">طلبك</h2>
            <button onClick={handleClear} className="text-xs text-chili hover:opacity-80">
              إفراغ السلة
            </button>
          </div>

          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-line">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <ProductImagePlaceholder className="h-full w-full" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{item.name}</p>
                  <p className="text-xs text-muted">
                    {formatPrice(item.price * item.qty, restaurant.currency)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gold/40">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="px-2 py-1 text-gold hover:text-gold-soft"
                    aria-label="إنقاص الكمية"
                  >
                    −
                  </button>
                  <span className="min-w-4 text-center text-sm text-cream">{item.qty}</span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="px-2 py-1 text-gold hover:text-gold-soft"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="shrink-0 text-xs text-chili hover:opacity-80"
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm text-cream"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-base">
            {itemCount}
          </span>
          <span className="font-display font-bold text-gold">
            {formatPrice(total, restaurant.currency)}
          </span>
          <span className="text-xs text-muted">{expanded ? "إخفاء" : "عرض الطلب"}</span>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          إرسال الطلب عبر واتساب
        </a>
      </div>
    </div>
  );
}
