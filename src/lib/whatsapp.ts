import type { CartItem } from "@/context/CartContext";
import type { Restaurant, SimpleListItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";

export type CheckoutInfo = {
  orderType: "pickup" | "delivery";
  branchId: string;
  zoneId: string;
  name: string;
  phone: string;
  address: string;
  paymentMethodId: string;
  notes: string;
};

export const emptyCheckoutInfo: CheckoutInfo = {
  orderType: "pickup",
  branchId: "",
  zoneId: "",
  name: "",
  phone: "",
  address: "",
  paymentMethodId: "",
  notes: "",
};

export function buildWhatsAppOrderUrl(
  items: CartItem[],
  restaurant: Restaurant,
  checkout: CheckoutInfo,
  branches: SimpleListItem[],
  deliveryZones: SimpleListItem[],
  paymentMethods: SimpleListItem[]
): string {
  const phone = restaurant.phone.replace(/\D/g, "");

  const branchName = branches.find((b) => b.id === checkout.branchId)?.name;
  const zoneName = deliveryZones.find((z) => z.id === checkout.zoneId)?.name;
  const paymentMethodName = paymentMethods.find((p) => p.id === checkout.paymentMethodId)?.name;

  const itemLines = items.flatMap((item) => [
    `🔹 ${item.qty} × ${item.name}`,
    `   السعر: ${formatPrice(item.price, restaurant.currency)}`,
    `   الإجمالي: ${formatPrice(item.price * item.qty, restaurant.currency)}`,
  ]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = items.reduce(
    (sum, item) =>
      sum + (item.originalPrice ? (item.originalPrice - item.price) * item.qty : 0),
    0
  );

  const lines = [
    `طلب جديد - ${restaurant.name}`,
    "",
    checkout.orderType === "pickup" ? "🏪 طلب استلام من الفرع" : "🚚 طلب توصيل",
    "",
    ...(branchName ? [`الفرع: ${branchName}`] : []),
    ...(checkout.orderType === "delivery" && zoneName ? [`المنطقة: ${zoneName}`] : []),
    ...(branchName || (checkout.orderType === "delivery" && zoneName) ? [""] : []),
    `العميل: ${checkout.name}`,
    `الهاتف: ${checkout.phone}`,
    ...(checkout.orderType === "delivery" ? [`العنوان: ${checkout.address}`] : []),
    "",
    "الطلب:",
    ...itemLines,
    "",
    `المجموع الفرعي: ${formatPrice(total, restaurant.currency)}`,
    `الإجمالي: ${formatPrice(total, restaurant.currency)}`,
    ...(savings > 0 ? [`💰 وفّرت: ${formatPrice(savings, restaurant.currency)}`] : []),
    "",
    ...(paymentMethodName ? [`طريقة الدفع: ${paymentMethodName}`] : []),
    `ملاحظات: ${checkout.notes.trim() || "-"}`,
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
