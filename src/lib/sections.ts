import type { MediaKitProject, SectionId } from "@/types";

export function sectionHasContent(project: MediaKitProject, id: SectionId): boolean {
  const { profile, platforms, audience, examples, offers, rates, terms } = project;
  switch (id) {
    case "cover":
      return Boolean(profile.publicName || profile.brandName || profile.photoDataUrl);
    case "about":
      return Boolean(profile.shortBio || profile.longBio || profile.publicName);
    case "platforms":
      return platforms.length > 0;
    case "audienceStats":
      return platforms.some(
        (p) =>
          p.followers !== null ||
          p.avgViews !== null ||
          p.avgImpressions !== null ||
          p.avgReach !== null ||
          p.interactions !== null,
      );
    case "audienceProfile":
      return (
        audience.ageRanges.length > 0 ||
        audience.genders.length > 0 ||
        audience.locations.length > 0 ||
        audience.interests.length > 0 ||
        Boolean(audience.notes)
      );
    case "niches":
      return profile.primaryNiches.length > 0 || profile.secondaryNiches.length > 0;
    case "performances":
      return platforms.some((p) => p.avgViews !== null || p.engagementRate !== null || p.interactions !== null);
    case "examples":
      return examples.some((e) => e.title || e.url || e.description);
    case "offers":
      return offers.some((o) => o.enabled && (o.title || o.price !== null || o.deliverables.length));
    case "rates":
      return rates.length > 0;
    case "contact":
      return Boolean(
        profile.professionalEmail ||
          profile.website ||
          profile.portfolio ||
          profile.socialLinks.some((l) => l.url),
      );
    case "terms":
      return Boolean(terms.trim());
    default:
      return false;
  }
}

export function visibleSectionIds(project: MediaKitProject): SectionId[] {
  return project.sections
    .filter((section) => section.enabled)
    .filter((section) => project.appearance.showEmptySections || sectionHasContent(project, section.id))
    .map((section) => section.id);
}

export function projectCompleteness(project: MediaKitProject): { filled: number; total: number } {
  const checks = [
    Boolean(project.profile.publicName),
    Boolean(project.profile.shortBio),
    project.platforms.length > 0,
    project.offers.some((o) => o.enabled && o.price !== null),
    Boolean(project.appearance.templateId),
  ];
  return { filled: checks.filter(Boolean).length, total: checks.length };
}
