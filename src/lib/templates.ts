import type { TemplateId } from "@/types";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  accent: string;
  secondary: string;
  preview: string;
  printFriendly: boolean;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "minimal",
    name: "Minimal",
    nameFr: "Minimal",
    description: "Quiet whitespace, thin rules, and a single accent. Easy to read in print and black and white.",
    descriptionFr: "Beaucoup d’espace, filets fins et un seul accent. Lisible à l’impression et en noir et blanc.",
    accent: "#5B4CFF",
    secondary: "#111827",
    preview: "/images/template-minimal.jpg",
    printFriendly: true,
  },
  {
    id: "editorial",
    name: "Editorial",
    nameFr: "Éditorial",
    description: "Magazine hierarchy with serif headlines, cream paper, and a two-column rhythm.",
    descriptionFr: "Hiérarchie magazine, titres serif, papier crème et rythme en deux colonnes.",
    accent: "#9A3412",
    secondary: "#1C1917",
    preview: "/images/template-editorial.jpg",
    printFriendly: true,
  },
  {
    id: "bold",
    name: "Bold Creator",
    nameFr: "Créateur audacieux",
    description: "Oversized type, high contrast blocks, and stats that feel like a poster.",
    descriptionFr: "Typographie XXL, blocs contrastés et statistiques façon affiche.",
    accent: "#7C3AED",
    secondary: "#09090B",
    preview: "/images/template-bold.jpg",
    printFriendly: false,
  },
  {
    id: "gaming",
    name: "Gaming",
    nameFr: "Gaming",
    description: "Dark HUD layout with neon frames for streamers and esports creators.",
    descriptionFr: "Mise en page sombre type HUD, cadres néon pour streamers et créateurs esport.",
    accent: "#22D3EE",
    secondary: "#0B1020",
    preview: "/images/template-gaming.jpg",
    printFriendly: false,
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    nameFr: "Lifestyle",
    description: "Warm, rounded, photography-first layout for beauty, food, and travel.",
    descriptionFr: "Mise en page chaude et arrondie, centrée photo, pour beauté, food et voyage.",
    accent: "#E11D48",
    secondary: "#7C2D12",
    preview: "/images/template-lifestyle.jpg",
    printFriendly: true,
  },
  {
    id: "business",
    name: "Business",
    nameFr: "Business",
    description: "Structured navy grid, tables, and conservative type for B2B and LinkedIn-first creators.",
    descriptionFr: "Grille marine structurée, tableaux et typo sobre pour le B2B et LinkedIn.",
    accent: "#1D4ED8",
    secondary: "#0F172A",
    preview: "/images/template-business.jpg",
    printFriendly: true,
  },
];

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export const PLATFORM_META: Record<
  string,
  { label: string; color: string }
> = {
  youtube: { label: "YouTube", color: "#FF0033" },
  tiktok: { label: "TikTok", color: "#111111" },
  instagram: { label: "Instagram", color: "#E1306C" },
  twitch: { label: "Twitch", color: "#9146FF" },
  facebook: { label: "Facebook", color: "#1877F2" },
  x: { label: "X", color: "#111111" },
  pinterest: { label: "Pinterest", color: "#E60023" },
  linkedin: { label: "LinkedIn", color: "#0A66C2" },
  website: { label: "Website", color: "#5B4CFF" },
  custom: { label: "Custom", color: "#64748B" },
};

export const FORMAT_LABELS: Record<string, { en: string; fr: string }> = {
  long_video: { en: "Long-form video", fr: "Vidéo longue" },
  short_video: { en: "Short-form video", fr: "Vidéo courte" },
  sponsored_integration: { en: "Sponsored integration", fr: "Intégration sponsorisée" },
  classic_post: { en: "Classic post", fr: "Publication classique" },
  story: { en: "Story", fr: "Story" },
  series: { en: "Content series", fr: "Série de publications" },
  live: { en: "Live", fr: "Live" },
  ugc: { en: "UGC creation", fr: "Création UGC" },
  multi_platform: { en: "Multi-platform pack", fr: "Pack multi-plateformes" },
  custom: { en: "Custom format", fr: "Format personnalisé" },
};

export const SECTION_LABELS: Record<string, { en: string; fr: string }> = {
  cover: { en: "Cover", fr: "Couverture" },
  about: { en: "About the creator", fr: "Présentation du créateur" },
  platforms: { en: "Platforms", fr: "Plateformes" },
  audienceStats: { en: "Audience statistics", fr: "Statistiques d’audience" },
  audienceProfile: { en: "Audience profile", fr: "Profil de l’audience" },
  niches: { en: "Niches & topics", fr: "Niches et thématiques" },
  performances: { en: "Content performance", fr: "Performances de contenu" },
  examples: { en: "Selected work", fr: "Exemples de réalisations" },
  offers: { en: "Packages", fr: "Offres commerciales" },
  rates: { en: "Indicative rates", fr: "Tarifs indicatifs" },
  contact: { en: "Professional contact", fr: "Coordonnées professionnelles" },
  terms: { en: "Notes & terms", fr: "Conditions générales" },
};
