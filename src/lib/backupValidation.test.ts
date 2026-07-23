import { describe, it, expect } from "vitest";
import { isValidBackupSnapshot } from "@/lib/backupValidation";

const validSnapshot = {
  categories: [],
  items: [],
  suppliers: [],
  heroImages: [],
  branches: [],
  deliveryZones: [],
  paymentMethods: [],
  posterLinks: [],
  restaurant: null,
};

describe("isValidBackupSnapshot", () => {
  it("accepts a well-formed empty snapshot", () => {
    expect(isValidBackupSnapshot(validSnapshot)).toBe(true);
  });

  it("accepts a snapshot with actual data and a restaurant object", () => {
    expect(
      isValidBackupSnapshot({
        ...validSnapshot,
        categories: [{ id: "c1", name: "دواجن", icon: "🍗" }],
        restaurant: { name: "بلو فريز" },
      })
    ).toBe(true);
  });

  it("rejects null/undefined/non-object input", () => {
    expect(isValidBackupSnapshot(null)).toBe(false);
    expect(isValidBackupSnapshot(undefined)).toBe(false);
    expect(isValidBackupSnapshot("just a string")).toBe(false);
    expect(isValidBackupSnapshot(42)).toBe(false);
  });

  it("rejects an object missing required array fields", () => {
    expect(isValidBackupSnapshot({ foo: "bar" })).toBe(false);
    const missingCategories: Record<string, unknown> = { ...validSnapshot };
    delete missingCategories.categories;
    expect(isValidBackupSnapshot(missingCategories)).toBe(false);
  });

  it("rejects when a required field isn't actually an array", () => {
    expect(isValidBackupSnapshot({ ...validSnapshot, items: "not an array" })).toBe(false);
    expect(isValidBackupSnapshot({ ...validSnapshot, suppliers: null })).toBe(false);
  });
});
