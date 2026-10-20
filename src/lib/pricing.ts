import type { ContentFormat, IndicativeRate, PricingAssumptions } from "@/types";
import { DEFAULT_ASSUMPTIONS } from "@/types";

export interface PriceBreakdown {
  production: number;
  audience: number;
  complexityFactor: number;
  usageFactor: number;
  exclusivityFactor: number;
  revisions: number;
  rushFactor: number;
  subtotal: number;
  total: number;
  low: number;
  high: number;
  sufficient: boolean;
  warnings: string[];
}

export const FORMAT_PRODUCTION_FACTOR: Record<ContentFormat, number> = {
  long_video: 2.2,
  short_video: 0.9,
  sponsored_integration: 1.4,
  classic_post: 0.7,
  story: 0.45,
  series: 2.6,
  live: 1.6,
  ugc: 1.1,
  multi_platform: 2.4,
  custom: 1,
};

export function calculateIndicativePrice(
  rate: Pick<
    IndicativeRate,
    | "deliverableCount"
    | "avgViews"
    | "productionEffort"
    | "complexity"
    | "extraRevisions"
    | "usageRightsLevel"
    | "exclusivityLevel"
    | "rush"
    | "minimumBudget"
    | "overridePrice"
    | "format"
  >,
  assumptions: PricingAssumptions = DEFAULT_ASSUMPTIONS,
): PriceBreakdown {
  const warnings: string[] = [];
  const count = Math.max(1, Number.isFinite(rate.deliverableCount) ? rate.deliverableCount : 1);
  const formatFactor = FORMAT_PRODUCTION_FACTOR[rate.format] ?? 1;
  const effort = clampPositive(rate.productionEffort, 1);
  const complexity = clampPositive(rate.complexity, 1);

  const production =
    assumptions.productionBase * count * formatFactor * effort * Math.max(0.1, assumptions.complexityWeight);

  const hasViews = rate.avgViews !== null && rate.avgViews !== undefined && Number.isFinite(rate.avgViews) && rate.avgViews >= 0;
  const audience = hasViews ? (rate.avgViews! / 1000) * assumptions.audienceCpm * count : 0;
  if (!hasViews) warnings.push("missing_views");

  const complexityFactor = 1 + Math.max(0, complexity - 1) * 0.35;
  const usageFactor = 1 + Math.max(0, rate.usageRightsLevel) * 0.25 * Math.max(0, assumptions.usageRightsWeight);
  const exclusivityFactor =
    1 + Math.max(0, rate.exclusivityLevel) * 0.3 * Math.max(0, assumptions.exclusivityWeight);
  const extraRevisions = Math.max(0, rate.extraRevisions || 0);
  const revisions = extraRevisions * Math.max(0, assumptions.revisionFee);
  const rushFactor = rate.rush ? Math.max(1, assumptions.rushMultiplier) : 1;

  const subtotal = (production + audience) * complexityFactor * usageFactor * exclusivityFactor + revisions;
  let total = subtotal * rushFactor;

  if (rate.minimumBudget !== null && rate.minimumBudget !== undefined && Number.isFinite(rate.minimumBudget)) {
    total = Math.max(total, rate.minimumBudget);
  }

  if (rate.overridePrice !== null && rate.overridePrice !== undefined && Number.isFinite(rate.overridePrice)) {
    total = rate.overridePrice;
  }

  if (!Number.isFinite(total) || total < 0) {
    return {
      production: 0,
      audience: 0,
      complexityFactor,
      usageFactor,
      exclusivityFactor,
      revisions,
      rushFactor,
      subtotal: 0,
      total: 0,
      low: 0,
      high: 0,
      sufficient: false,
      warnings: ["invalid_result"],
    };
  }

  const rounded = Math.round(total);
  const spread = hasViews ? 0.12 : 0.22;
  return {
    production: Math.round(production),
    audience: Math.round(audience),
    complexityFactor: round2(complexityFactor),
    usageFactor: round2(usageFactor),
    exclusivityFactor: round2(exclusivityFactor),
    revisions: Math.round(revisions),
    rushFactor: round2(rushFactor),
    subtotal: Math.round(subtotal),
    total: rounded,
    low: Math.round(rounded * (1 - spread)),
    high: Math.round(rounded * (1 + spread)),
    sufficient: hasViews,
    warnings,
  };
}

function clampPositive(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function resetAssumptions(): PricingAssumptions {
  return { ...DEFAULT_ASSUMPTIONS };
}
