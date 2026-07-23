import { describe, it, expect } from "vitest";
import type { Timestamp } from "firebase/firestore";
import {
  isDiscountActive,
  getDiscountPercent,
  getVariantDiscountFields,
  itemHasAnyDiscount,
  getItemMaxDiscountPercent,
  pickCheapestVariant,
  getItemSortPrice,
} from "@/lib/discount";

function futureTimestamp(): Timestamp {
  return { toMillis: () => Date.now() + 60_000 } as Timestamp;
}

function pastTimestamp(): Timestamp {
  return { toMillis: () => Date.now() - 60_000 } as Timestamp;
}

describe("isDiscountActive", () => {
  it("is false when there is no discountPrice", () => {
    expect(isDiscountActive({ price: 100 })).toBe(false);
  });

  it("is false when discountPrice is not lower than price", () => {
    expect(isDiscountActive({ price: 100, discountPrice: 100 })).toBe(false);
    expect(isDiscountActive({ price: 100, discountPrice: 120 })).toBe(false);
  });

  it("is true when discountPrice is lower and no expiry", () => {
    expect(isDiscountActive({ price: 100, discountPrice: 80 })).toBe(true);
  });

  it("is false once discountEndsAt is in the past", () => {
    expect(
      isDiscountActive({ price: 100, discountPrice: 80, discountEndsAt: pastTimestamp() })
    ).toBe(false);
  });

  it("is true while discountEndsAt is still in the future", () => {
    expect(
      isDiscountActive({ price: 100, discountPrice: 80, discountEndsAt: futureTimestamp() })
    ).toBe(true);
  });
});

describe("getDiscountPercent", () => {
  it("returns 0 when the discount isn't active", () => {
    expect(getDiscountPercent({ price: 100 })).toBe(0);
  });

  it("rounds the percentage off the original price", () => {
    expect(getDiscountPercent({ price: 100, discountPrice: 75 })).toBe(25);
    // 100 -> 33: (1 - 33/100) * 100 = 67
    expect(getDiscountPercent({ price: 100, discountPrice: 33 })).toBe(67);
  });
});

describe("getVariantDiscountFields", () => {
  it("falls back to the item's own fields when there is no variant", () => {
    const item = { price: 100, discountPrice: 80 };
    expect(getVariantDiscountFields(item)).toEqual(item);
  });

  it("uses the variant's own price/discount, independent of the item", () => {
    const item = { price: 100, discountPrice: 80 };
    const variant = { id: "v", label: "كبير", price: 200, discountPrice: 150 };
    expect(getVariantDiscountFields(item, variant)).toEqual({
      price: 200,
      discountPrice: 150,
      discountEndsAt: undefined,
    });
  });
});

describe("itemHasAnyDiscount / getItemMaxDiscountPercent", () => {
  it("checks the base price when there are no variants", () => {
    expect(itemHasAnyDiscount({ price: 100, discountPrice: 90 })).toBe(true);
    expect(itemHasAnyDiscount({ price: 100 })).toBe(false);
  });

  it("is true if any variant has an active discount", () => {
    const item = {
      price: 100,
      variants: [
        { id: "v", label: "صغير", price: 50 },
        { id: "v", label: "كبير", price: 100, discountPrice: 70 },
      ],
    };
    expect(itemHasAnyDiscount(item)).toBe(true);
    expect(getItemMaxDiscountPercent(item)).toBe(30);
  });

  it("returns the highest discount percent across variants", () => {
    const item = {
      price: 100,
      variants: [
        { id: "v", label: "صغير", price: 50, discountPrice: 45 }, // 10%
        { id: "v", label: "كبير", price: 100, discountPrice: 60 }, // 40%
      ],
    };
    expect(getItemMaxDiscountPercent(item)).toBe(40);
  });
});

describe("pickCheapestVariant", () => {
  it("returns undefined when there are no variants", () => {
    expect(pickCheapestVariant({})).toBeUndefined();
    expect(pickCheapestVariant({ variants: [] })).toBeUndefined();
  });

  it("picks the lowest base price when nothing is discounted", () => {
    const variants = [
      { id: "v", label: "صغير", price: 100 },
      { id: "v", label: "كبير", price: 50 },
    ];
    expect(pickCheapestVariant({ variants })?.label).toBe("كبير");
  });

  it("picks by effective (discounted) price, not sticker price", () => {
    // "صغير" is cheaper on paper (80) but "كبير" is cheaper after its own discount (60).
    const variants = [
      { id: "v", label: "صغير", price: 80 },
      { id: "v", label: "كبير", price: 150, discountPrice: 60 },
    ];
    expect(pickCheapestVariant({ variants })?.label).toBe("كبير");
  });
});

describe("getItemSortPrice", () => {
  it("uses the item's own effective price when there are no variants", () => {
    expect(getItemSortPrice({ price: 100 })).toBe(100);
    expect(getItemSortPrice({ price: 100, discountPrice: 80 })).toBe(80);
  });

  it("uses the cheapest variant's effective price", () => {
    const item = {
      price: 100,
      variants: [
        { id: "v", label: "صغير", price: 80 },
        { id: "v", label: "كبير", price: 150, discountPrice: 60 },
      ],
    };
    expect(getItemSortPrice(item)).toBe(60);
  });
});
