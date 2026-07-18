import { sendPushNotification } from "@/lib/sendPushNotification";

export function notifyNewItem(params: {
  itemName: string;
  supplierName?: string;
  badge?: string;
}): Promise<void> {
  const { itemName, supplierName, badge } = params;
  const details = [supplierName, badge].filter(Boolean).join(" - ");
  return sendPushNotification({
    title: "صنف جديد 🆕",
    body: `تم إضافة صنف جديد: ${itemName}${details ? ` (${details})` : ""}`,
  });
}
