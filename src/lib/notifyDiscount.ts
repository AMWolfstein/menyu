import { auth } from "@/lib/firebase";

/** بيبعت إشعار Push لكل الزباين المشتركين بخصوص خصم جديد على صنف —
 * فشل الإرسال (شبكة، مفيش مشتركين، إلخ) متعمّد إنه ميوقفش حفظ الصنف نفسه. */
export async function notifyDiscount(params: {
  itemName: string;
  supplierName?: string;
  badge?: string;
  discountPercent: number;
}): Promise<void> {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    await fetch("/api/send-discount-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, ...params }),
    });
  } catch {
    // تجاهل — إرسال الإشعار عملية ثانوية
  }
}
