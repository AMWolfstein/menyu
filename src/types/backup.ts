// نظام النسخ الاحتياطي التلقائي — لقطة كاملة من بيانات المنيو والإعدادات
// الأساسية، تُحفظ داخل Firestore نفسه (مفيش خدمة خارجية جديدة مطلوبة).

import type { Timestamp } from "firebase/firestore";
import type { FirestoreCategory, FirestoreItem } from "@/lib/firestore";
import type { HeroImage, Restaurant, SimpleListItem } from "@/types/menu";

export type BackupSnapshot = {
  categories: FirestoreCategory[];
  items: FirestoreItem[];
  suppliers: SimpleListItem[];
  heroImages: HeroImage[];
  restaurant: Restaurant | null;
};

export type BackupRecord = {
  id: string;
  createdAt: Timestamp;
  data: BackupSnapshot;
};

export type BackupFrequency = "daily" | "weekly" | "monthly";

export type BackupConfig = {
  frequency: BackupFrequency;
  /** للتكرار الأسبوعي — 0 (الأحد) لـ 6 (السبت). */
  dayOfWeek?: number;
  /** للتكرار الشهري — 1 لـ 31. */
  dayOfMonth?: number;
  /**
   * الساعة المفضّلة (0-23) — معلوماتية فقط، مبتتحكمش في وقت تشغيل الـ cron
   * الفعلي. الوقت الحقيقي ثابت في vercel.json ومحتاج تعديل كود وديبلوي جديد.
   */
  preferredHour?: number;
  lastRunAt?: Timestamp;
};
