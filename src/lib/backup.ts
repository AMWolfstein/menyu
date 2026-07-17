// منطق النسخ الاحتياطي/الاسترجاع المشترك — بيشتغل من المتصفح (زرار "نسخ
// احتياطي الآن" في لوحة التحكم) ومن مسار الـ cron السيرفري على حد سواء،
// طالما فيه جلسة Firestore موثّقة (أدمن).

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { BackupConfig, BackupRecord, BackupSnapshot } from "@/types/backup";

/** أقصى عدد نسخ نحتفظ بيه — أي نسخة أقدم بتتمسح تلقائيًا بعد كل نسخة جديدة. */
const MAX_BACKUPS_RETAINED = 10;

const BACKUP_COLLECTIONS = ["categories", "items", "suppliers", "heroImages"] as const;
type BackupCollectionName = (typeof BACKUP_COLLECTIONS)[number];

async function readCollection(name: string): Promise<{ id: string; [key: string]: unknown }[]> {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** بيقرا كل بيانات المنيو والإعدادات الحالية ويحفظها كنسخة احتياطية جديدة. */
export async function runBackup(): Promise<string> {
  const [categories, items, suppliers, heroImages, restaurantSnap] = await Promise.all([
    readCollection("categories"),
    readCollection("items"),
    readCollection("suppliers"),
    readCollection("heroImages"),
    getDoc(doc(db, "settings", "restaurant")),
  ]);

  const snapshot: BackupSnapshot = {
    categories: categories as BackupSnapshot["categories"],
    items: items as BackupSnapshot["items"],
    suppliers: suppliers as BackupSnapshot["suppliers"],
    heroImages: heroImages as BackupSnapshot["heroImages"],
    restaurant: restaurantSnap.exists() ? (restaurantSnap.data() as BackupSnapshot["restaurant"]) : null,
  };

  const backupRef = doc(collection(db, "backups"));
  await setDoc(backupRef, { createdAt: serverTimestamp(), data: snapshot });

  await pruneOldBackups();

  return backupRef.id;
}

/** بيمسح أي نسخ احتياطية زيادة عن الحد الأقصى، الأقدم أولاً. */
async function pruneOldBackups(): Promise<void> {
  const q = query(collection(db, "backups"), orderBy("createdAt", "desc"));
  const all = await getDocs(q);
  const excess = all.docs.slice(MAX_BACKUPS_RETAINED);
  await Promise.all(excess.map((d) => deleteDoc(d.ref)));
}

/**
 * بيرجع كل البيانات لحالتها وقت النسخة الاحتياطية المحددة بالظبط — بيمسح أي
 * مستند مش موجود في النسخة، وبيكتب/يستبدل كل مستندات النسخة. إجراء نهائي
 * وغير قابل للتراجع.
 */
export async function restoreBackup(backupId: string): Promise<void> {
  const backupSnap = await getDoc(doc(db, "backups", backupId));
  if (!backupSnap.exists()) {
    throw new Error("النسخة الاحتياطية غير موجودة");
  }
  const { data } = backupSnap.data() as { data: BackupSnapshot };

  let batch = writeBatch(db);
  let opCount = 0;
  const commitIfFull = async () => {
    if (opCount >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      opCount = 0;
    }
  };

  for (const name of BACKUP_COLLECTIONS) {
    const collectionName: BackupCollectionName = name;
    const currentSnap = await getDocs(collection(db, collectionName));
    const backupIds = new Set(data[collectionName].map((entry) => entry.id));

    for (const d of currentSnap.docs) {
      if (!backupIds.has(d.id)) {
        batch.delete(d.ref);
        opCount++;
        await commitIfFull();
      }
    }

    for (const entry of data[collectionName]) {
      const { id, ...fields } = entry;
      batch.set(doc(db, collectionName, id), fields);
      opCount++;
      await commitIfFull();
    }
  }

  if (data.restaurant) {
    batch.set(doc(db, "settings", "restaurant"), data.restaurant);
    opCount++;
  }

  if (opCount > 0) {
    await batch.commit();
  }
}

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

export function subscribeBackups(cb: (backups: BackupRecord[]) => void): Unsubscribe {
  const q = query(collection(db, "backups"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BackupRecord, "id">) })));
  });
}
