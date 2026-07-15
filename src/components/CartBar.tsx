"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { buildWhatsAppOrderUrl, emptyCheckoutInfo, type CheckoutInfo } from "@/lib/whatsapp";
import { branchesApi, deliveryZonesApi, paymentMethodsApi, saveOrder } from "@/lib/firestore";
import { useSimpleList } from "@/hooks/useSimpleList";
import { formatPrice } from "@/lib/format";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import CheckoutForm from "@/components/CheckoutForm";
import type { Restaurant } from "@/types/menu";

export default function CartBar({ restaurant }: { restaurant: Restaurant }) {
  const { items, itemCount, total, removeItem, setQty, clearCart } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutInfo>(emptyCheckoutInfo);

  const { items: branches } = useSimpleList(branchesApi);
  const { items: deliveryZones } = useSimpleList(deliveryZonesApi);
  const { items: paymentMethods } = useSimpleList(paymentMethodsApi);

  if (itemCount === 0) return null;

  const canSend =
    checkout.name.trim() !== "" &&
    checkout.phone.trim() !== "" &&
    (checkout.orderType !== "delivery" || checkout.address.trim() !== "");

  const whatsappUrl = buildWhatsAppOrderUrl(
    items,
    restaurant,
    checkout,
    branches,
    deliveryZones,
    paymentMethods
  );

  const handleClear = () => {
    if (window.confirm("إفراغ السلة بالكامل؟")) clearCart();
  };

  const handleSend = () => {
    const branchName = branches.find((b) => b.id === checkout.branchId)?.name;
    const zoneName = deliveryZones.find((z) => z.id === checkout.zoneId)?.name;
    const paymentMethodName = paymentMethods.find((p) => p.id === checkout.paymentMethodId)?.name;
    const savings = items.reduce(
      (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0),
      0
    );
    // مش بننتظر النتيجة عشان ما نأخرش فتح واتساب — الحفظ بيحصل في الخلفية.
    saveOrder({
      items: items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        variantLabel: item.variantLabel,
        price: item.price,
        originalPrice: item.originalPrice,
        qty: item.qty,
      })),
      total,
      savings,
      orderType: checkout.orderType,
      branchName,
      zoneName,
      customerName: checkout.name,
      customerPhone: checkout.phone,
      address: checkout.orderType === "delivery" ? checkout.address : undefined,
      paymentMethodName,
      notes: checkout.notes,
    }).catch(() => {
      // فشل حفظ السجل مش لازم يمنع إرسال الطلب نفسه للزبون.
    });
    clearCart();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 max-h-[85vh] overflow-y-auto border-t border-line bg-surface/95 backdrop-blur">
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
                    <ProductImagePlaceholder className="h-full w-full" logoUrl={restaurant.imageUrl} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">
                    {item.name}
                    {item.variantLabel && (
                      <span className="text-muted"> ({item.variantLabel})</span>
                    )}
                  </p>
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

          <CheckoutForm
            restaurant={restaurant}
            branches={branches}
            deliveryZones={deliveryZones}
            paymentMethods={paymentMethods}
            value={checkout}
            onChange={setCheckout}
          />
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

        {canSend ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSend}
            className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            إرسال الطلب عبر واتساب
          </a>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="rounded-lg bg-[#25D366]/40 px-4 py-2 text-sm font-bold text-white/70"
            title="أكمل الاسم ورقم الهاتف أولاً"
          >
            إرسال الطلب عبر واتساب
          </button>
        )}
      </div>
    </div>
  );
}
