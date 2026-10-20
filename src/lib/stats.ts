import type { EngagementMethod, Platform } from "@/types";

export interface EngagementResult {
  rate: number | null;
  formula: string;
  reason?: string;
}

export function calculateEngagementRate(
  interactions: number | null | undefined,
  denominator: number | null | undefined,
  method: EngagementMethod,
): EngagementResult {
  const formulaMap: Record<EngagementMethod, string> = {
    followers: "interactions / followers × 100",
    reach: "interactions / reach × 100",
    impressions: "interactions / impressions × 100",
  };
  const formula = formulaMap[method];

  if (interactions === null || interactions === undefined) {
    return { rate: null, formula, reason: "missing_interactions" };
  }
  if (denominator === null || denominator === undefined) {
    return { rate: null, formula, reason: "missing_denominator" };
  }
  if (!Number.isFinite(interactions) || !Number.isFinite(denominator)) {
    return { rate: null, formula, reason: "invalid_number" };
  }
  if (interactions < 0 || denominator < 0) {
    return { rate: null, formula, reason: "negative_value" };
  }
  if (denominator === 0) {
    return { rate: null, formula, reason: "zero_denominator" };
  }

  const rate = (interactions / denominator) * 100;
  if (!Number.isFinite(rate)) {
    return { rate: null, formula, reason: "invalid_result" };
  }
  return { rate, formula };
}

export function denominatorFor(platform: Platform): number | null {
  if (platform.engagementMethod === "followers") return platform.followers;
  if (platform.engagementMethod === "reach") return platform.avgReach;
  return platform.avgImpressions;
}

export function platformEngagement(platform: Platform): EngagementResult {
  return calculateEngagementRate(
    platform.interactions,
    denominatorFor(platform),
    platform.engagementMethod,
  );
}

export interface AudienceTotals {
  followerSum: number | null;
  viewsSum: number | null;
  impressionsSum: number | null;
  reachSum: number | null;
  followerPlatforms: number;
  mixedMethods: boolean;
}

export function aggregateAudience(platforms: Platform[]): AudienceTotals {
  const withFollowers = platforms.filter((p) => p.followers !== null && Number.isFinite(p.followers));
  const withViews = platforms.filter((p) => p.avgViews !== null && Number.isFinite(p.avgViews));
  const withImpressions = platforms.filter((p) => p.avgImpressions !== null && Number.isFinite(p.avgImpressions));
  const withReach = platforms.filter((p) => p.avgReach !== null && Number.isFinite(p.avgReach));

  return {
    followerSum: withFollowers.length ? withFollowers.reduce((s, p) => s + (p.followers ?? 0), 0) : null,
    viewsSum: withViews.length ? withViews.reduce((s, p) => s + (p.avgViews ?? 0), 0) : null,
    impressionsSum: withImpressions.length ? withImpressions.reduce((s, p) => s + (p.avgImpressions ?? 0), 0) : null,
    reachSum: withReach.length ? withReach.reduce((s, p) => s + (p.avgReach ?? 0), 0) : null,
    followerPlatforms: withFollowers.length,
    mixedMethods: new Set(platforms.map((p) => p.engagementMethod)).size > 1,
  };
}

export function growthPercent(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  if (previous <= 0) return null;
  const value = ((current - previous) / previous) * 100;
  return Number.isFinite(value) ? value : null;
}
