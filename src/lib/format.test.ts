import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("adds thousands separators", () => {
    expect(formatPrice(1234, "جنيه مصري")).toBe("1,234 ج.م");
  });

  it("abbreviates known currency names", () => {
    expect(formatPrice(50, "جنيه مصري")).toBe("50 ج.م");
    expect(formatPrice(50, "جنية مصري")).toBe("50 ج.م");
  });

  it("falls back to the raw currency string when unknown", () => {
    expect(formatPrice(50, "USD")).toBe("50 USD");
  });

  it("trims the currency before matching the abbreviation table", () => {
    expect(formatPrice(50, "  جنيه مصري  ")).toBe("50 ج.م");
  });
});
