import type { LiveMenuItem } from "@/hooks/useMenuData";

/** عدد الأصناف اللي بتاخد شارة "الأكثر طلباً" تلقائيًا على الصفحة الرئيسية. */
export const BEST_SELLER_BADGE_COUNT = 3;

/** عدد الأصناف اللي بتظهر في تاب "الأكثر مبيعاً" على الصفحة الرئيسية. */
export const BEST_SELLERS_TAB_COUNT = 20;

/**
 * أعلى الأصناف مبيعًا فعليًا (حسب عدد مرات الطلب الحقيقي orderCount) على
 * مستوى الموقع كله — مش شارة بتتحط يدويًا، بتتحسب لحظيًا من بيانات الطلبات
 * الحقيقية.
 */
export function getBestSellers<T extends LiveMenuItem>(items: T[], topN: number): T[] {
  return [...items]
    .filter((item) => (item.orderCount ?? 0) > 0)
    .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
    .slice(0, topN);
}
