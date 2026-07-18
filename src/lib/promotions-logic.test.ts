import { describe, it, expect } from "vitest";
import {
  findPromotionForProduct,
  computeDiscountedPrice,
  type ActivePromotion,
} from "@/lib/promotions-logic";

function makePromotion(overrides: Partial<ActivePromotion>): ActivePromotion {
  return {
    id: "promo-1",
    name: "Promo",
    description: null,
    discount_type: "percentage",
    discount_percentage: 10,
    fixed_price: null,
    category_id: null,
    start_at: new Date().toISOString(),
    end_at: new Date().toISOString(),
    show_countdown: false,
    banner_enabled: false,
    cta_text: null,
    cta_url: null,
    status: "published",
    is_active: true,
    deleted_at: null,
    deleted_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    productIds: [],
    ...overrides,
  } as ActivePromotion;
}

describe("findPromotionForProduct", () => {
  it("matches a promotion that targets the product directly", () => {
    const promo = makePromotion({ productIds: ["p1"] });
    expect(findPromotionForProduct([promo], "p1", null)).toBe(promo);
  });

  it("matches a promotion that targets the product's category", () => {
    const promo = makePromotion({ category_id: "cat-1", productIds: [] });
    expect(findPromotionForProduct([promo], "p1", "cat-1")).toBe(promo);
  });

  it("returns undefined when neither product nor category match", () => {
    const promo = makePromotion({ category_id: "cat-1", productIds: ["p2"] });
    expect(findPromotionForProduct([promo], "p1", "cat-2")).toBeUndefined();
  });

  it("returns undefined for an empty promotions list", () => {
    expect(findPromotionForProduct([], "p1", "cat-1")).toBeUndefined();
  });
});

describe("computeDiscountedPrice", () => {
  it("applies a percentage discount rounded to 2 decimals", () => {
    const promo = makePromotion({ discount_type: "percentage", discount_percentage: 15 });
    expect(computeDiscountedPrice(1999, promo)).toBe(1699.15);
  });

  it("uses the fixed price when discount_type is fixed_price", () => {
    const promo = makePromotion({ discount_type: "fixed_price", fixed_price: 500 });
    expect(computeDiscountedPrice(1999, promo)).toBe(500);
  });

  it("returns the original price when the relevant discount field is missing", () => {
    const promo = makePromotion({ discount_type: "percentage", discount_percentage: null });
    expect(computeDiscountedPrice(1000, promo)).toBe(1000);
  });
});
