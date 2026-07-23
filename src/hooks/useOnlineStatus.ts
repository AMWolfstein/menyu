import { useEffect, useState } from "react";

/** حالة الاتصال بالإنترنت لحظيًا — بيتحدث تلقائي مع أحداث online/offline
 * المتصفح. القيمة الأولى (navigator.onLine وقت أول render) بتتقرا جوه
 * useEffect مش useState مباشرة، عشان الـ server render دايمًا "متصل"
 * افتراضيًا (مفيش navigator على السيرفر) من غير أي اختلاف بين السيرفر
 * والعميل وقت الـ hydration. */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // مش lazy initializer عشان navigator مش موجود وقت الـ SSR — لازم نستنى
    // أول client effect عشان القيمة الحقيقية توصل من غير اختلاف hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
