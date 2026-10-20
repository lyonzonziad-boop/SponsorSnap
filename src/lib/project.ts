import { createId } from "@/lib/id";
import {
  DATA_VERSION,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_SECTIONS,
  type AudienceProfile,
  type CreatorProfile,
  type MediaKitProject,
  type Platform,
  type PricingOffer,
} from "@/types";

export function emptyProfile(): CreatorProfile {
  return {
    publicName: "",
    brandName: "",
    photoDataUrl: "",
    logoDataUrl: "",
    shortBio: "",
    longBio: "",
    country: "",
    languages: [],
    primaryNiches: [],
    secondaryNiches: [],
    professionalEmail: "",
    website: "",
    portfolio: "",
    socialLinks: [],
    brandColor: "#5B4CFF",
    secondaryColor: "#0F172A",
    fontFamily: "sans",
  };
}

export function emptyAudience(): AudienceProfile {
  return {
    ageRanges: [],
    genders: [],
    locations: [],
    interests: [],
    notes: "",
  };
}

export function emptyPlatform(partial?: Partial<Platform>): Platform {
  return {
    id: createId("plt"),
    type: "youtube",
    customName: "",
    url: "",
    handle: "",
    followers: null,
    avgViews: null,
    avgImpressions: null,
    avgReach: null,
    interactions: null,
    engagementRate: null,
    engagementMethod: "followers",
    postingFrequency: "",
    statsMethodNote: "",
    statsUpdatedAt: "",
    ...partial,
  };
}

export function defaultOffers(currency: string): PricingOffer[] {
  const base: Array<Pick<PricingOffer, "title" | "description" | "order">> = [
    { title: "Starter", description: "", order: 0 },
    { title: "Standard", description: "", order: 1 },
    { title: "Premium", description: "", order: 2 },
  ];
  return base.map((item) => ({
    id: createId("off"),
    title: item.title,
    description: item.description,
    price: null,
    currency,
    deliverables: [],
    revisions: 1,
    usageRights: "",
    turnaround: "",
    conditions: "",
    enabled: true,
    order: item.order,
  }));
}

export function createProject(name = "Untitled media kit", currency = "EUR"): MediaKitProject {
  const now = new Date().toISOString();
  return {
    id: createId("kit"),
    name,
    createdAt: now,
    updatedAt: now,
    version: DATA_VERSION,
    profile: emptyProfile(),
    platforms: [],
    audience: emptyAudience(),
    examples: [],
    offers: defaultOffers(currency),
    rates: [],
    assumptions: { ...DEFAULT_ASSUMPTIONS },
    sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
    appearance: {
      templateId: "minimal",
      accentColor: "#5B4CFF",
      secondaryColor: "#0F172A",
      fontFamily: "sans",
      showEmptySections: false,
    },
    terms: "",
    statsSelfDeclared: true,
    ratesIndicative: true,
  };
}

export function duplicateProject(project: MediaKitProject, nameSuffix: string): MediaKitProject {
  const now = new Date().toISOString();
  return {
    ...structuredClone(project),
    id: createId("kit"),
    name: `${project.name} ${nameSuffix}`.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function touch(project: MediaKitProject): MediaKitProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function hasMeaningfulContent(project: MediaKitProject): boolean {
  return Boolean(
    project.profile.publicName ||
      project.profile.shortBio ||
      project.platforms.length ||
      project.offers.some((o) => o.price !== null || o.deliverables.length),
  );
}
