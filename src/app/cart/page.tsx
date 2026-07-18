"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useMenuData } from "@/hooks/useMenuData";
import { useSimpleList } from "@/hooks/useSimpleList";
import { branchesApi, deliveryZonesApi, paymentMethodsApi, saveOrder } from "@/lib/firestore";
import { buildWhatsAppOrderUrl, emptyCheckoutInfo, type CheckoutInfo } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";
import CheckoutForm from "@/components/CheckoutForm";

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { restaurant, loading } = useMenuData();
  const { items, itemCount, total, removeItem, setQty, clearCart } = useCart();
  const [checkout, setCheckout] = useState<CheckoutInfo>(emptyCheckoutInfo);

  const { items: branches } = useSimpleList(branchesApi);
  const { items: deliveryZones } = useSimpleList(deliveryZonesApi);
  const { items: paymentMethods } = useSimpleList(paymentMethodsApi);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24 text-muted">
        جارٍ التحميل...
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="flex flex-1 items-center justify-center py-24 text-muted">
        لم تتم تعبئة بيانات المطعم بعد.
      </main>
    );
  }

  const savings = items.reduce(
    (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0),
    0
  );

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
    if (!window.confirm("إفراغ السلة بالكامل؟")) return;
    clearCart();
    router.push("/");
  };

  const handleSend = () => {
    const branchName = branches.find((b) => b.id === checkout.branchId)?.name;
    const zoneName = deliveryZones.find((z) => z.id === checkout.zoneId)?.name;
    const paymentMethodName = paymentMethods.find((p) => p.id === checkout.paymentMethodId)?.name;
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
    router.push("/");
  };

  if (itemCount === 0) {
    return (
      <main className="flex-1 px-4 py-20 text-center">
        <p className="text-muted">السلة فاضية.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-gold hover:text-gold-soft">
          تصفح المنيو
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-cream">
            السلة <span className="text-base font-normal text-muted">({itemCount})</span>
          </h1>
          <button onClick={handleClear} className="text-xs text-chili hover:opacity-80">
            إفراغ السلة
          </button>
        </div>

        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <ProductImagePlaceholder
                    className="h-full w-full"
                    logoUrl={restaurant.imageUrl}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-cream">
                  {item.name}
                  {item.variantLabel && (
                    <span className="font-normal text-muted"> ({item.variantLabel})</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatPrice(item.price, restaurant.currency)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-gold/40">
                <button
                  onClick={() => setQty(item.id, item.qty - 1)}
                  className="px-2.5 py-1.5 text-gold hover:text-gold-soft"
                  aria-label="إنقاص الكمية"
                >
                  −
                </button>
                <span className="min-w-5 text-center text-sm text-cream">{item.qty}</span>
                <button
                  onClick={() => setQty(item.id, item.qty + 1)}
                  className="px-2.5 py-1.5 text-gold hover:text-gold-soft"
                  aria-label="زيادة الكمية"
                >
                  +
                </button>
              </div>

              <div className="w-20 shrink-0 text-end text-sm font-bold text-gold">
                {formatPrice(item.price * item.qty, restaurant.currency)}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                aria-label="حذف"
                className="shrink-0 rounded-lg p-2 text-chili transition-colors hover:bg-chili/10"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-line bg-surface/60 p-5">
          <h2 className="font-display text-lg font-bold text-cream">ملخص الطلب</h2>
          <div className="mt-3 space-y-1.5 text-sm">
            {savings > 0 && (
              <div className="flex items-center justify-between text-muted">
                <span>التوفير</span>
                <span className="text-chili">-{formatPrice(savings, restaurant.currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-line pt-2 font-display text-base font-bold text-cream">
              <span>الإجمالي</span>
              <span className="text-gold">{formatPrice(total, restaurant.currency)}</span>
            </div>
          </div>

          <CheckoutForm
            restaurant={restaurant}
            branches={branches}
            deliveryZones={deliveryZones}
            paymentMethods={paymentMethods}
            value={checkout}
            onChange={setCheckout}
          />

          {canSend ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSend}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              إرسال الطلب عبر واتساب
            </a>
          ) : (
            <button
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-lg bg-[#25D366]/40 px-4 py-3 text-sm font-bold text-white/70"
              title="أكمل الاسم ورقم الهاتف أولاً"
            >
              إرسال الطلب عبر واتساب
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gold hover:text-gold-soft">
            ← متابعة التسوق
          </Link>
        </div>
      </div>
    </main>
  );
}
