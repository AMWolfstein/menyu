// دوال منطقية بحتة من نظام النسخ الاحتياطي — من غير أي استيراد لـ Firebase،
// عشان تتقدر تتفحص باختبارات وحدة (unit tests) عادية من غير Firestore/Auth.
// بتتصدّر تاني من backup.ts عشان الاستدعاءات الحالية تفضل شغالة زي ما هي.

import type { BackupConfig, BackupSnapshot } from "@/types/backup";

/** هل معاد نسخة احتياطية تلقائية النهارده حسب الجدول المحفوظ؟ */
export function isBackupDueToday(config: BackupConfig, now: Date = new Date()): boolean {
  if (config.frequency === "daily") return true;
  if (config.frequency === "weekly") return now.getDay() === config.dayOfWeek;
  if (config.frequency === "monthly") return now.getDate() === config.dayOfMonth;
  return false;
}

/** هل النسخة التلقائية اتعملت بالفعل النهارده (تفادي تكرارها لو الـ cron اتنفذ مرتين)؟ */
export function alreadyRanToday(config: BackupConfig, now: Date = new Date()): boolean {
  if (!config.lastRunAt) return false;
  const last = config.lastRunAt.toDate();
  return last.toDateString() === now.toDateString();
}

/** فحص سطحي إن الملف المُحمّل من الكمبيوتر شكله فعلاً لقطة نسخة احتياطية
 * صالحة قبل ما نحاول نسترجعها — بيحمي من ملف غلط أو تالف يمسح البيانات
 * الحالية بمحتوى فاضي. */
export function isValidBackupSnapshot(value: unknown): value is BackupSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.categories) &&
    Array.isArray(v.items) &&
    Array.isArray(v.suppliers) &&
    Array.isArray(v.heroImages) &&
    Array.isArray(v.branches) &&
    Array.isArray(v.deliveryZones) &&
    Array.isArray(v.paymentMethods) &&
    Array.isArray(v.posterLinks)
  );
}
