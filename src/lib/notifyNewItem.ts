import { formatPrice } from "@/lib/format";
import { sendPushNotification } from "@/lib/sendPushNotification";

export function notifyNewItem(params: {
  itemName: string;
  supplierName?: string;
  badge?: string;
  price: number;
  currency: string;
  imageUrl?: string;
}): Promise<void> {
  const { itemName, supplierName, badge, price, currency, imageUrl } = params;
  const details = [supplierName?.trim(), badge].filter(Boolean).join(" - ");
  return sendPushNotification({
    title: "صنف جديد 🆕",
    body: `تم إضافة صنف جديد: ${itemName}${
      details ? ` (${details})` : ""
    } — السعر: ${formatPrice(price, currency)}`,
    imageUrl,
  });
}
