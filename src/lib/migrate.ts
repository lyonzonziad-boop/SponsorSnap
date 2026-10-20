import { createProject } from "@/lib/project";
import { sanitizeDataUrl } from "@/lib/validation";
import {
  DATA_VERSION,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_SECTIONS,
  type AudienceProfile,
  type CreatorProfile,
  type KitAppearance,
  type MediaKitProject,
  type PricingAssumptions,
  type SectionId,
} from "@/types";

export function migrateProject(raw: Record<string, unknown>): MediaKitProject {
  const base = createProject();
  const version = typeof raw.version === "number" ? raw.version : 1;
  const profileRaw = isRecord(raw.profile) ? raw.profile : {};
  const audienceRaw = isRecord(raw.audience) ? raw.audience : {};
  const assumptionsRaw = isRecord(raw.assumptions) ? raw.assumptions : {};
  const appearanceRaw = isRecord(raw.appearance) ? raw.appearance : {};

  const merged: MediaKitProject = {
    ...base,
    ...pickKnown(raw, base),
    version: DATA_VERSION,
    profile: {
      ...base.profile,
      ...(profileRaw as unknown as Partial<CreatorProfile>),
      photoDataUrl: sanitizeDataUrl(profileRaw.photoDataUrl),
      logoDataUrl: sanitizeDataUrl(profileRaw.logoDataUrl),
    },
    platforms: Array.isArray(raw.platforms) ? (raw.platforms as MediaKitProject["platforms"]) : [],
    audience: {
      ...base.audience,
      ...(audienceRaw as unknown as Partial<AudienceProfile>),
    },
    examples: Array.isArray(raw.examples) ? (raw.examples as MediaKitProject["examples"]) : [],
    offers: Array.isArray(raw.offers) ? (raw.offers as MediaKitProject["offers"]) : base.offers,
    rates: Array.isArray(raw.rates) ? (raw.rates as MediaKitProject["rates"]) : [],
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      ...(assumptionsRaw as unknown as Partial<PricingAssumptions>),
    },
    sections: migrateSections(raw.sections),
    appearance: {
      ...base.appearance,
      ...(appearanceRaw as unknown as Partial<KitAppearance>),
    },
    terms: typeof raw.terms === "string" ? raw.terms : "",
    statsSelfDeclared: raw.statsSelfDeclared !== false,
    ratesIndicative: raw.ratesIndicative !== false,
  };

  if (version < 1) {
    merged.statsSelfDeclared = true;
  }

  return merged;
}

function migrateSections(value: unknown): MediaKitProject["sections"] {
  if (!Array.isArray(value)) return DEFAULT_SECTIONS.map((s) => ({ ...s }));
  const byId = new Map<string, boolean>();
  for (const item of value) {
    if (item && typeof item === "object" && "id" in item) {
      const id = String((item as { id: string }).id) as SectionId;
      byId.set(id, Boolean((item as { enabled?: boolean }).enabled));
    }
  }
  return DEFAULT_SECTIONS.map((s) => ({
    id: s.id,
    enabled: byId.has(s.id) ? Boolean(byId.get(s.id)) : s.enabled,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickKnown(raw: Record<string, unknown>, base: MediaKitProject): Partial<MediaKitProject> {
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : base.id,
    name: typeof raw.name === "string" && raw.name ? raw.name : base.name,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : base.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
  };
}
