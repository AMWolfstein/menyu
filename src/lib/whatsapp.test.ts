import { describe, it, expect } from "vitest";
import { buildWhatsAppOrderUrl, emptyCheckoutInfo, type CheckoutInfo } from "@/lib/whatsapp";
import type { CartItem } from "@/context/CartContext";
import type { Restaurant, SimpleListItem } from "@/types/menu";

const restaurant: Restaurant = {
  name: "بلو فريز",
  tagline: "",
  currency: "جنيه مصري",
  phone: "+20 100 000 0000",
};

const branches: SimpleListItem[] = [{ id: "b1", name: "فرع مدينة نصر", order: 0 }];
const zones: SimpleListItem[] = [{ id: "z1", name: "مدينة نصر", order: 0 }];
const paymentMethods: SimpleListItem[] = [{ id: "p1", name: "كاش عند الاستلام", order: 0 }];

function decode(url: string): string {
  const text = new URL(url).searchParams.get("text");
  return decodeURIComponent(text ?? "");
}

const oneItem: CartItem[] = [
  { id: "1", itemId: "1", name: "سجق شرقي", price: 100, qty: 2 },
];

describe("buildWhatsAppOrderUrl", () => {
  it("targets the restaurant's phone with digits only", () => {
    const url = buildWhatsAppOrderUrl(oneItem, restaurant, emptyCheckoutInfo, [], [], []);
    expect(url.startsWith("https://wa.me/201000000000?text=")).toBe(true);
  });

  it("shows a pickup line and no address when orderType is pickup", () => {
    const msg = decode(
      buildWhatsAppOrderUrl(
        oneItem,
        restaurant,
        { ...emptyCheckoutInfo, name: "أحمد", phone: "0100", orderType: "pickup" },
        [],
        [],
        []
      )
    );
    expect(msg).toContain("🏪 طلب استلام من الفرع");
    expect(msg).not.toContain("العنوان:");
  });

  it("shows delivery line, zone, and address when orderType is delivery", () => {
    const checkout: CheckoutInfo = {
      ...emptyCheckoutInfo,
      orderType: "delivery",
      name: "أحمد",
      phone: "0100",
      address: "شارع النصر ١٠",
      zoneId: "z1",
    };
    const msg = decode(buildWhatsAppOrderUrl(oneItem, restaurant, checkout, branches, zones, []));
    expect(msg).toContain("🚚 طلب توصيل");
    expect(msg).toContain("المنطقة: مدينة نصر");
    expect(msg).toContain("العنوان: شارع النصر ١٠");
  });

  it("resolves branch/payment method names from their ids", () => {
    const checkout: CheckoutInfo = {
      ...emptyCheckoutInfo,
      name: "أحمد",
      phone: "0100",
      branchId: "b1",
      paymentMethodId: "p1",
    };
    const msg = decode(
      buildWhatsAppOrderUrl(oneItem, restaurant, checkout, branches, zones, paymentMethods)
    );
    expect(msg).toContain("الفرع: فرع مدينة نصر");
    expect(msg).toContain("طريقة الدفع: كاش عند الاستلام");
  });

  it("includes supplier name and badge under the item line", () => {
    const items: CartItem[] = [
      { id: "1", itemId: "1", name: "سجق شرقي", supplierName: "المورد الذهبي ", badge: "حار", price: 100, qty: 1 },
    ];
    const msg = decode(buildWhatsAppOrderUrl(items, restaurant, emptyCheckoutInfo, [], [], []));
    expect(msg).toContain("المورد الذهبي - حار");
  });

  it("computes totals and only shows savings when there actually are any", () => {
    const noDiscount = decode(
      buildWhatsAppOrderUrl(oneItem, restaurant, emptyCheckoutInfo, [], [], [])
    );
    expect(noDiscount).toContain("الإجمالي: 200 ج.م");
    expect(noDiscount).not.toContain("وفّرت");

    const discounted: CartItem[] = [
      { id: "1", itemId: "1", name: "سجق شرقي", price: 80, originalPrice: 100, qty: 2 },
    ];
    const withDiscount = decode(
      buildWhatsAppOrderUrl(discounted, restaurant, emptyCheckoutInfo, [], [], [])
    );
    expect(withDiscount).toContain("الإجمالي: 160 ج.م");
    expect(withDiscount).toContain("وفّرت: 40 ج.م");
  });

  it("falls back to '-' for empty notes", () => {
    const msg = decode(buildWhatsAppOrderUrl(oneItem, restaurant, emptyCheckoutInfo, [], [], []));
    expect(msg).toContain("ملاحظات: -");
  });
});
