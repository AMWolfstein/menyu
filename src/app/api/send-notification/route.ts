import { NextResponse } from "next/server";
import webpush from "web-push";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllPushSubscriptionsOnce } from "@/lib/firestore";
import { cloudinaryNotificationImageUrl } from "@/lib/cloudinaryIcon";

type NotifyBody = {
  idToken?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
};

/** بيتأكد إن الـ idToken فعلاً صادر من مستخدم حقيقي في مشروع Firebase بتاعنا
 * — بدون Admin SDK، عن طريق نداء REST بسيط لـ Identity Toolkit. */
async function isValidToken(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || !idToken) return false;
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return Array.isArray(data.users) && data.users.length > 0;
}

/** مسار عام بيبعت إشعار Push لكل المشتركين — مستخدم من أكتر من مكان
 * (خصومات، أصناف جديدة، إلخ)، كل واحد بيبني نص الإشعار بتاعه بنفسه. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as NotifyBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { idToken, title, body: message, imageUrl } = body;

  if (!(await isValidToken(idToken ?? ""))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!title || !message) {
    return NextResponse.json({ error: "Missing title/body" }, { status: 400 });
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return NextResponse.json({ error: "Missing VAPID env vars" }, { status: 500 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const email = process.env.BACKUP_ADMIN_EMAIL;
  const password = process.env.BACKUP_ADMIN_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing BACKUP_ADMIN_EMAIL / BACKUP_ADMIN_PASSWORD env vars" },
      { status: 500 }
    );
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    return NextResponse.json({ error: "Admin auth failed" }, { status: 500 });
  }

  const subscriptions = await getAllPushSubscriptionsOnce();
  const payload = JSON.stringify({
    title,
    body: message,
    image: imageUrl ? cloudinaryNotificationImageUrl(imageUrl) : undefined,
  });

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
