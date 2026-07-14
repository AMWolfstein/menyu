import type { Timestamp } from "firebase/firestore";

type DiscountFields = {
  price: number;
  discountPrice?: number;
  discountEndsAt?: Timestamp;
};

/** الخصم فعّال لو السعر المخفّض أقل من الأصلي ومفيش تاريخ انتهاء فات. */
export function isDiscountActive(item: DiscountFields): boolean {
  if (item.discountPrice == null || item.discountPrice >= item.price) return false;
  if (item.discountEndsAt && item.discountEndsAt.toMillis() < Date.now()) return false;
  return true;
}

export function getDiscountPercent(item: DiscountFields): number {
  if (!isDiscountActive(item)) return 0;
  return Math.round((1 - item.discountPrice! / item.price) * 100);
}
