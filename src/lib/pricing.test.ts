import { describe, expect, it } from "vitest";
import { calculateIndicativePrice, resetAssumptions } from "@/lib/pricing";
import { DEFAULT_ASSUMPTIONS } from "@/types";

const base = {
  deliverableCount: 1,
  avgViews: 10000,
  productionEffort: 1,
  complexity: 1,
  extraRevisions: 0,
  usageRightsLevel: 0,
  exclusivityLevel: 0,
  rush: false,
  minimumBudget: null,
  overridePrice: null,
  format: "short_video" as const,
};

describe("calculateIndicativePrice", () => {
  it("returns a finite total", () => {
    const result = calculateIndicativePrice(base);
    expect(Number.isFinite(result.total)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
    expect(result.sufficient).toBe(true);
  });

  it("widens the range when views are missing", () => {
    const withViews = calculateIndicativePrice(base);
    const without = calculateIndicativePrice({ ...base, avgViews: null });
    expect(without.sufficient).toBe(false);
    expect(without.warnings).toContain("missing_views");
    const spreadWith = (withViews.high - withViews.low) / withViews.total;
    const spreadWithout = (without.high - without.low) / without.total;
    expect(spreadWithout).toBeGreaterThan(spreadWith);
  });

  it("honours an override and a minimum budget", () => {
    expect(calculateIndicativePrice({ ...base, overridePrice: 999 }).total).toBe(999);
    const withMin = calculateIndicativePrice({ ...base, avgViews: 0, minimumBudget: 5000, productionEffort: 0.1 });
    expect(withMin.total).toBeGreaterThanOrEqual(5000);
  });

  it("does not emit Infinity for wild inputs", () => {
    const result = calculateIndicativePrice({
      ...base,
      deliverableCount: Number.NaN,
      avgViews: Number.POSITIVE_INFINITY,
      productionEffort: -10,
    });
    expect(Number.isFinite(result.total)).toBe(true);
  });

  it("resetAssumptions returns defaults", () => {
    expect(resetAssumptions()).toEqual(DEFAULT_ASSUMPTIONS);
  });
});
