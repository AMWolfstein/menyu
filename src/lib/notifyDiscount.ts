import { formatPrice } from "@/lib/format";
import { sendPushNotification } from "@/lib/sendPushNotification";

export function notifyDiscount(params: {
  itemName: string;
  supplierName?: string;
  badge?: string;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  imageUrl?: string;
}): Promise<void> {
  const { itemName, supplierName, badge, discountPercent, discountedPrice, currency, imageUrl } =
    params;
  const details = [supplierName?.trim(), badge].filter(Boolean).join(" - ");
  return sendPushNotification({
    title: "خصومات 🔥",
    body: `يوجد خصم ${discountPercent}% على ${itemName}${
      details ? ` (${details})` : ""
    } — السعر بعد الخصم: ${formatPrice(discountedPrice, currency)}`,
    imageUrl,
  });
}
