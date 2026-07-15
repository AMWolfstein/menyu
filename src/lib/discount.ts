import type { Timestamp } from "firebase/firestore";
import type { MenuItemVariant } from "@/types/menu";

type DiscountFields = {
  price: number;
  discountPrice?: number;
  discountEndsAt?: Timestamp;
};

type ItemWithVariants = DiscountFields & { variants?: MenuItemVariant[] };

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

/**
 * بيانات الخصم الخاصة بوزن معيّن، أو بالصنف نفسه لو مفيش أوزان (وزن غير
 * محدد). تاريخ الانتهاء دايمًا من الصنف نفسه — حقل واحد مشترك بينطبق على
 * أي خصم عليه، سواء كان على السعر الأساسي أو على وزن بعينه.
 */
export function getVariantDiscountFields(
  item: ItemWithVariants,
  variant?: MenuItemVariant
): DiscountFields {
  if (variant) {
    return {
      price: variant.price,
      discountPrice: variant.discountPrice,
      discountEndsAt: item.discountEndsAt,
    };
  }
  return item;
}

/** هل فيه أي خصم فعّال على الصنف — على سعره الأساسي أو على أي وزن من أوزانه؟ */
export function itemHasAnyDiscount(item: ItemWithVariants): boolean {
  if (item.variants && item.variants.length > 0) {
    return item.variants.some((v) => isDiscountActive(getVariantDiscountFields(item, v)));
  }
  return isDiscountActive(item);
}

/** أعلى نسبة خصم فعّالة على الصنف — لأغراض الترتيب وشارة الخصم. */
export function getItemMaxDiscountPercent(item: ItemWithVariants): number {
  if (item.variants && item.variants.length > 0) {
    return Math.max(
      0,
      ...item.variants.map((v) => getDiscountPercent(getVariantDiscountFields(item, v)))
    );
  }
  return getDiscountPercent(item);
}

/** أرخص وزن في الصنف — يُستخدم كسعر تلخيصي سريع (صور المشاركة، السيو). */
export function pickCheapestVariant(item: {
  variants?: MenuItemVariant[];
}): MenuItemVariant | undefined {
  if (!item.variants || item.variants.length === 0) return undefined;
  return item.variants.reduce((min, v) => (v.price < min.price ? v : min));
}
