import { auth } from "@/lib/firebase";

/** بيبعت إشعار Push لكل الزباين المشتركين — فشل الإرسال (شبكة، مفيش
 * مشتركين، إلخ) متعمّد إنه ميوقفش العملية اللي استدعته. */
export async function sendPushNotification(params: {
  title: string;
  body: string;
  imageUrl?: string;
}): Promise<void> {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, ...params }),
    });
  } catch {
    // تجاهل — إرسال الإشعار عملية ثانوية
  }
}
