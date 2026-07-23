import { describe, it, expect } from "vitest";
import { getBestSellers } from "@/lib/bestSellers";
import type { LiveMenuItem } from "@/hooks/useMenuData";

function item(id: string, orderCount?: number): LiveMenuItem {
  return {
    id,
    name: id,
    description: "",
    price: 100,
    orderCount,
  } as LiveMenuItem;
}

describe("getBestSellers", () => {
  it("excludes items that have never been ordered", () => {
    const items = [item("a", 5), item("b"), item("c", 0)];
    const result = getBestSellers(items, 10);
    expect(result.map((i) => i.id)).toEqual(["a"]);
  });

  it("sorts by orderCount descending", () => {
    const items = [item("a", 2), item("b", 8), item("c", 5)];
    const result = getBestSellers(items, 10);
    expect(result.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });

  it("caps the result at topN", () => {
    const items = [item("a", 5), item("b", 4), item("c", 3), item("d", 2)];
    const result = getBestSellers(items, 2);
    expect(result.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the original array", () => {
    const items = [item("a", 2), item("b", 8)];
    const original = [...items];
    getBestSellers(items, 10);
    expect(items).toEqual(original);
  });
});
