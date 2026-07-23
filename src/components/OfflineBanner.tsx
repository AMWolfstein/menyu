"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/** شريط تنبيه لما النت يقطع — البيانات المعروضة وقتها آخر نسخة اتخزنت
 * محليًا (Firestore offline persistence)، مش لايف، فمهم الزبون يعرف. */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-40 bg-chili px-4 py-2 text-center text-xs font-bold text-white">
      مفيش اتصال بالإنترنت حاليًا — بتشوف آخر نسخة متاحة من المنيو، الأسعار ممكن تكون اتغيّرت.
    </div>
  );
}
