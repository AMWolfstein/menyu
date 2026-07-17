import { NextResponse } from "next/server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { getBackupConfigOnce, saveBackupConfig } from "@/lib/firestore";
import { runBackup, isBackupDueToday, alreadyRanToday } from "@/lib/backup";

// Vercel بيضيف Authorization: Bearer <CRON_SECRET> تلقائيًا لأي طلب جاي من
// الجدولة (cron) بمجرد ما متغير البيئة CRON_SECRET يبقى متظبط — ده بيمنع أي
// حد تاني يشغّل الـ endpoint ده يدويًا من برّه.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const config = await getBackupConfigOnce();
  if (!config) {
    return NextResponse.json({ ranBackup: false, reason: "no backup schedule configured" });
  }
  if (!isBackupDueToday(config)) {
    return NextResponse.json({ ranBackup: false, reason: "not scheduled today" });
  }
  if (alreadyRanToday(config)) {
    return NextResponse.json({ ranBackup: false, reason: "already ran today" });
  }

  const backupId = await runBackup();
  await saveBackupConfig({ ...config, lastRunAt: Timestamp.now() });

  return NextResponse.json({ ranBackup: true, backupId });
}
