export const DATA_VERSION = 1 as const;

export type TemplateId =
  | "minimal"
  | "editorial"
  | "bold"
  | "gaming"
  | "lifestyle"
  | "business";

export type PlatformType =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitch"
  | "facebook"
  | "x"
  | "pinterest"
  | "linkedin"
  | "website"
  | "custom";

export type EngagementMethod = "followers" | "reach" | "impressions";

export type ThemePreference = "light" | "dark" | "system";

export type Language = "en" | "fr";

export type ContentFormat =
  | "long_video"
  | "short_video"
  | "sponsored_integration"
  | "classic_post"
  | "story"
  | "series"
  | "live"
  | "ugc"
  | "multi_platform"
  | "custom";

export type SectionId =
  | "cover"
  | "about"
  | "platforms"
  | "audienceStats"
  | "audienceProfile"
  | "niches"
  | "performances"
  | "examples"
  | "offers"
  | "rates"
  | "contact"
  | "terms";

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface CreatorProfile {
  publicName: string;
  brandName: string;
  photoDataUrl: string;
  logoDataUrl: string;
  shortBio: string;
  longBio: string;
  country: string;
  languages: string[];
  primaryNiches: string[];
  secondaryNiches: string[];
  professionalEmail: string;
  website: string;
  portfolio: string;
  socialLinks: SocialLink[];
  brandColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface Platform {
  id: string;
  type: PlatformType;
  customName: string;
  url: string;
  handle: string;
  followers: number | null;
  avgViews: number | null;
  avgImpressions: number | null;
  avgReach: number | null;
  interactions: number | null;
  engagementRate: number | null;
  engagementMethod: EngagementMethod;
  postingFrequency: string;
  statsMethodNote: string;
  statsUpdatedAt: string;
}

export interface DemographicSlice {
  id: string;
  label: string;
  percent: number;
}

export interface AudienceProfile {
  ageRanges: DemographicSlice[];
  genders: DemographicSlice[];
  locations: DemographicSlice[];
  interests: string[];
  notes: string;
}

export interface ContentExample {
  id: string;
  title: string;
  url: string;
  description: string;
  metricLabel: string;
  metricValue: string;
}

export interface PricingOffer {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  deliverables: string[];
  revisions: number | null;
  usageRights: string;
  turnaround: string;
  conditions: string;
  enabled: boolean;
  order: number;
}

export interface IndicativeRate {
  id: string;
  platformId: string;
  format: ContentFormat;
  customFormat: string;
  deliverableCount: number;
  avgViews: number | null;
  productionEffort: number;
  complexity: number;
  turnaroundDays: number | null;
  revisionsIncluded: number;
  extraRevisions: number;
  usageRightsLevel: number;
  exclusivityLevel: number;
  rush: boolean;
  minimumBudget: number | null;
  currency: string;
  overridePrice: number | null;
  notes: string;
}

export interface PricingAssumptions {
  productionBase: number;
  audienceCpm: number;
  complexityWeight: number;
  usageRightsWeight: number;
  exclusivityWeight: number;
  revisionFee: number;
  rushMultiplier: number;
}

export interface SectionConfig {
  id: SectionId;
  enabled: boolean;
}

export interface KitAppearance {
  templateId: TemplateId;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  showEmptySections: boolean;
}

export interface MediaKitProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  profile: CreatorProfile;
  platforms: Platform[];
  audience: AudienceProfile;
  examples: ContentExample[];
  offers: PricingOffer[];
  rates: IndicativeRate[];
  assumptions: PricingAssumptions;
  sections: SectionConfig[];
  appearance: KitAppearance;
  terms: string;
  statsSelfDeclared: boolean;
  ratesIndicative: boolean;
}

export interface AppSettings {
  theme: ThemePreference;
  language: Language;
  defaultCurrency: string;
  autosave: boolean;
  pdfPageSize: "a4";
  lastProjectId: string | null;
}

export interface ExportPayload {
  format: "sponsorsnap-project";
  version: number;
  exportedAt: string;
  project: MediaKitProject;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "cover", enabled: true },
  { id: "about", enabled: true },
  { id: "platforms", enabled: true },
  { id: "audienceStats", enabled: true },
  { id: "audienceProfile", enabled: true },
  { id: "niches", enabled: true },
  { id: "performances", enabled: true },
  { id: "examples", enabled: true },
  { id: "offers", enabled: true },
  { id: "rates", enabled: true },
  { id: "contact", enabled: true },
  { id: "terms", enabled: false },
];

export const DEFAULT_ASSUMPTIONS: PricingAssumptions = {
  productionBase: 80,
  audienceCpm: 8,
  complexityWeight: 1,
  usageRightsWeight: 1,
  exclusivityWeight: 1,
  revisionFee: 40,
  rushMultiplier: 1.25,
};

export const FONT_OPTIONS = [
  { id: "sans", stack: "Outfit, ui-sans-serif, system-ui, sans-serif", label: "Sans" },
  { id: "serif", stack: 'Source Serif 4, "Iowan Old Style", Georgia, serif', label: "Serif" },
  { id: "system", stack: "ui-sans-serif, system-ui, sans-serif", label: "System" },
  { id: "mono", stack: 'ui-monospace, "SFMono-Regular", Menlo, monospace', label: "Mono" },
] as const;
