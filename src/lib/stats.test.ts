import { describe, expect, it } from "vitest";
import { aggregateAudience, calculateEngagementRate, growthPercent } from "@/lib/stats";
import { emptyPlatform } from "@/lib/project";

describe("calculateEngagementRate", () => {
  it("computes interactions / followers", () => {
    const result = calculateEngagementRate(250, 10000, "followers");
    expect(result.rate).toBeCloseTo(2.5);
    expect(result.formula).toContain("followers");
  });

  it("returns null for a zero denominator", () => {
    const result = calculateEngagementRate(10, 0, "impressions");
    expect(result.rate).toBeNull();
    expect(result.reason).toBe("zero_denominator");
  });

  it("rejects negative values", () => {
    expect(calculateEngagementRate(-1, 10, "reach").rate).toBeNull();
    expect(calculateEngagementRate(10, -1, "reach").reason).toBe("negative_value");
  });

  it("handles missing and non-finite values", () => {
    expect(calculateEngagementRate(null, 10, "followers").reason).toBe("missing_interactions");
    expect(calculateEngagementRate(10, null, "followers").reason).toBe("missing_denominator");
    expect(calculateEngagementRate(Number.NaN, 10, "followers").reason).toBe("invalid_number");
    expect(calculateEngagementRate(10, Number.POSITIVE_INFINITY, "followers").reason).toBe("invalid_number");
  });
});

describe("aggregateAudience", () => {
  it("does not invent totals when values are missing", () => {
    const totals = aggregateAudience([emptyPlatform(), emptyPlatform({ type: "tiktok" })]);
    expect(totals.followerSum).toBeNull();
    expect(totals.viewsSum).toBeNull();
  });

  it("sums only comparable follower counts", () => {
    const totals = aggregateAudience([
      emptyPlatform({ followers: 100 }),
      emptyPlatform({ type: "tiktok", followers: 50, avgViews: 20 }),
    ]);
    expect(totals.followerSum).toBe(150);
    expect(totals.viewsSum).toBe(20);
  });
});

describe("growthPercent", () => {
  it("returns null when previous is zero or missing", () => {
    expect(growthPercent(10, 0)).toBeNull();
    expect(growthPercent(10, null)).toBeNull();
  });

  it("computes a finite percent", () => {
    expect(growthPercent(150, 100)).toBeCloseTo(50);
  });
});
