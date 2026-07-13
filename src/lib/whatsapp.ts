import type { CartItem } from "@/context/CartContext";
import type { Restaurant } from "@/types/menu";
import { formatPrice } from "@/lib/format";

export function buildWhatsAppOrderUrl(items: CartItem[], restaurant: Restaurant): string {
  const phone = restaurant.phone.replace(/\D/g, "");

  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty, restaurant.currency)}`
  );

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const message = [
    `مرحباً 👋، حابب أطلب من ${restaurant.name}:`,
    "",
    ...lines,
    "",
    `الإجمالي: ${formatPrice(total, restaurant.currency)}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
