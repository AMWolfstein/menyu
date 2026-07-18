import { sendPushNotification } from "@/lib/sendPushNotification";

export function notifyDiscount(params: {
  itemName: string;
  supplierName?: string;
  badge?: string;
  discountPercent: number;
}): Promise<void> {
  const { itemName, supplierName, badge, discountPercent } = params;
  const details = [supplierName, badge].filter(Boolean).join(" - ");
  return sendPushNotification({
    title: "خصومات 🔥",
    body: `يوجد خصم ${discountPercent}% على ${itemName}${details ? ` (${details})` : ""}`,
  });
}
