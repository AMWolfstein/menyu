import type { LiveMenuCategory, LiveMenuItem } from "@/hooks/useMenuData";

/** عدد الأصناف اللي بتاخد شارة "الأكثر طلباً" تلقائيًا على الصفحة الرئيسية. */
export const BEST_SELLER_BADGE_COUNT = 3;

/**
 * أعلى الأصناف مبيعًا فعليًا (حسب عدد مرات الطلب الحقيقي orderCount) على
 * مستوى الموقع كله — مش شارة بتتحط يدويًا، بتتحسب لحظيًا من بيانات الطلبات
 * الحقيقية.
 */
export function getBestSellers(categories: LiveMenuCategory[], topN: number): LiveMenuItem[] {
  return categories
    .flatMap((c) => c.items)
    .filter((item) => (item.orderCount ?? 0) > 0)
    .sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0))
    .slice(0, topN);
}
