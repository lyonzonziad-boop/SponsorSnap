import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { mediaKitFilename } from "@/lib/filename";
import { calculateIndicativePrice } from "@/lib/pricing";
import { visibleSectionIds } from "@/lib/sections";
import { aggregateAudience, platformEngagement } from "@/lib/stats";
import { FORMAT_LABELS, PLATFORM_META, getTemplate } from "@/lib/templates";
import type { Language, MediaKitProject, Platform, SectionId } from "@/types";

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(full.slice(0, 6), 16);
  if (!Number.isFinite(n)) return [91, 76, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function templatePalette(project: MediaKitProject): {
  accent: RGB;
  ink: RGB;
  muted: RGB;
  paper: RGB;
  card: RGB;
  dark: boolean;
} {
  const accent = hexToRgb(project.appearance.accentColor || project.profile.brandColor || "#5B4CFF");
  const id = project.appearance.templateId;
  if (id === "gaming") {
    return { accent, ink: [236, 253, 255], muted: [148, 163, 184], paper: [11, 16, 32], card: [17, 24, 48], dark: true };
  }
  if (id === "bold") {
    return { accent, ink: [9, 9, 11], muted: [82, 82, 91], paper: [250, 250, 250], card: [24, 24, 27], dark: false };
  }
  if (id === "editorial") {
    return { accent, ink: [28, 25, 23], muted: [120, 113, 108], paper: [250, 244, 232], card: [255, 252, 245], dark: false };
  }
  if (id === "lifestyle") {
    return { accent, ink: [76, 29, 26], muted: [156, 91, 91], paper: [255, 247, 237], card: [255, 255, 255], dark: false };
  }
  if (id === "business") {
    return { accent, ink: [15, 23, 42], muted: [71, 85, 105], paper: [248, 250, 252], card: [255, 255, 255], dark: false };
  }
  return { accent, ink: [17, 24, 39], muted: [100, 116, 139], paper: [255, 255, 255], card: [248, 250, 252], dark: false };
}

class Writer {
  doc: InstanceType<typeof import("jspdf").jsPDF>;
  y = 18;
  margin = 16;
  pageW: number;
  pageH: number;
  colors: ReturnType<typeof templatePalette>;
  language: Language;
  project: MediaKitProject;

  constructor(project: MediaKitProject, language: Language, doc: InstanceType<typeof import("jspdf").jsPDF>) {
    this.doc = doc;
    this.pageW = this.doc.internal.pageSize.getWidth();
    this.pageH = this.doc.internal.pageSize.getHeight();
    this.colors = templatePalette(project);
    this.language = language;
    this.project = project;
    this.paintPage();
  }

  get contentW(): number {
    return this.pageW - this.margin * 2;
  }

  paintPage(): void {
    const { paper, dark, accent } = this.colors;
    this.doc.setFillColor(...paper);
    this.doc.rect(0, 0, this.pageW, this.pageH, "F");
    if (this.project.appearance.templateId === "minimal") {
      this.doc.setFillColor(...accent);
      this.doc.rect(0, 0, this.pageW, 2.2, "F");
    }
    if (this.project.appearance.templateId === "business") {
      this.doc.setFillColor(15, 23, 42);
      this.doc.rect(0, 0, this.pageW, 8, "F");
    }
    if (this.project.appearance.templateId === "gaming") {
      this.doc.setDrawColor(...accent);
      this.doc.setLineWidth(0.4);
      this.doc.rect(6, 6, this.pageW - 12, this.pageH - 12);
    }
    if (dark) {
      this.doc.setTextColor(...this.colors.ink);
    }
  }

  addPage(): void {
    this.doc.addPage();
    this.paintPage();
    this.y = this.project.appearance.templateId === "business" ? 18 : 18;
  }

  ensure(h: number): void {
    if (this.y + h > this.pageH - 16) {
      this.addPage();
    }
  }

  setInk(muted = false): void {
    const c = muted ? this.colors.muted : this.colors.ink;
    this.doc.setTextColor(...c);
  }

  wrapped(text: string, x: number, width: number, size = 10, leading = 5): number {
    if (!text) return 0;
    this.doc.setFontSize(size);
    const lines = this.doc.splitTextToSize(text, width) as string[];
    this.ensure(lines.length * leading);
    this.doc.text(lines, x, this.y);
    this.y += lines.length * leading;
    return lines.length * leading;
  }

  heading(text: string): void {
    this.ensure(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(this.project.appearance.templateId === "bold" ? 20 : 14);
    this.setInk();
    this.doc.setTextColor(...this.colors.accent);
    this.doc.text(text, this.margin, this.y);
    this.y += 4;
    this.doc.setDrawColor(...this.colors.accent);
    this.doc.setLineWidth(0.4);
    this.doc.line(this.margin, this.y, this.margin + (this.project.appearance.templateId === "editorial" ? 28 : 42), this.y);
    this.y += 8;
    this.doc.setFont("helvetica", "normal");
    this.setInk();
  }

  labelValue(label: string, value: string, x: number, width: number): void {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.setInk(true);
    this.doc.text(label.toUpperCase(), x, this.y);
    this.y += 5;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);
    this.setInk();
    this.wrapped(value, x, width, 11, 5.2);
  }
}

function platformName(p: Platform, language: Language): string {
  if (p.type === "custom" && p.customName) return p.customName;
  const meta = PLATFORM_META[p.type];
  if (p.type === "website") return language === "fr" ? "Site" : "Website";
  return meta?.label ?? p.type;
}

function copy(language: Language) {
  return language === "fr"
    ? {
        kit: "Media kit",
        about: "Présentation",
        platforms: "Plateformes",
        stats: "Statistiques d’audience",
        audience: "Profil d’audience",
        niches: "Niches et thématiques",
        perf: "Performances",
        work: "Exemples de réalisations",
        offers: "Offres",
        rates: "Tarifs indicatifs",
        contact: "Contact professionnel",
        terms: "Notes",
        followers: "Abonnés",
        views: "Vues moy.",
        impressions: "Impressions moy.",
        reach: "Portée moy.",
        engagement: "Engagement",
        missing: "Non renseigné",
        self: "Chiffres déclarés par le créateur. Non vérifiés indépendamment.",
        indicative: "Tarifs indicatifs. Ceci n’est pas une offre contractuelle.",
        noUnique: "Les totaux additionnent les comptes listés, pas des personnes uniques.",
        prepared: "Préparé avec SponsorSnap",
        primary: "Niches principales",
        secondary: "Niches secondaires",
        deliverables: "Livrables",
        revisions: "Révisions",
        rights: "Droits",
        turnaround: "Délai",
      }
    : {
        kit: "Media kit",
        about: "About",
        platforms: "Platforms",
        stats: "Audience statistics",
        audience: "Audience profile",
        niches: "Niches & topics",
        perf: "Content performance",
        work: "Selected work",
        offers: "Packages",
        rates: "Indicative rates",
        contact: "Professional contact",
        terms: "Notes",
        followers: "Followers",
        views: "Avg. views",
        impressions: "Avg. impressions",
        reach: "Avg. reach",
        engagement: "Engagement",
        missing: "Not provided",
        self: "Figures declared by the creator. Not independently verified.",
        indicative: "Indicative rates. Not a contractual offer.",
        noUnique: "Totals add listed accounts, not unique people.",
        prepared: "Prepared with SponsorSnap",
        primary: "Main niches",
        secondary: "Secondary niches",
        deliverables: "Deliverables",
        revisions: "Revisions",
        rights: "Usage rights",
        turnaround: "Turnaround",
      };
}

async function addRaster(doc: InstanceType<typeof import("jspdf").jsPDF>, dataUrl: string, x: number, y: number, w: number, h: number): Promise<void> {
  if (!dataUrl.startsWith("data:image/")) return;
  const format = dataUrl.includes("image/png") ? "PNG" : "JPEG";
  try {
    doc.addImage(dataUrl, format, x, y, w, h, undefined, "FAST");
  } catch {
    // Skip broken images rather than failing the whole export.
  }
}

export async function generateMediaKitPdf(project: MediaKitProject, language: Language): Promise<{ blob: Blob; filename: string }> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const w = new Writer(project, language, doc);
  const t = copy(language);
  const { profile } = project;
  const name = profile.publicName || profile.brandName || "Creator";
  const sections = visibleSectionIds(project);
  const palette = w.colors;

  const render = async (id: SectionId) => {
    switch (id) {
      case "cover": {
        w.ensure(80);
        if (profile.logoDataUrl) {
          await addRaster(w.doc, profile.logoDataUrl, w.margin, w.y, 18, 18);
        }
        if (profile.photoDataUrl) {
          await addRaster(w.doc, profile.photoDataUrl, w.pageW - w.margin - 36, w.y, 36, 36);
        }
        w.y += profile.logoDataUrl ? 24 : 8;
        w.doc.setFont("helvetica", "bold");
        w.doc.setFontSize(project.appearance.templateId === "bold" ? 32 : 26);
        w.setInk();
        w.wrapped(name, w.margin, w.contentW - 40, project.appearance.templateId === "bold" ? 32 : 26, 12);
        if (profile.brandName && profile.brandName !== profile.publicName) {
          w.doc.setFont("helvetica", "normal");
          w.doc.setFontSize(12);
          w.setInk(true);
          w.wrapped(profile.brandName, w.margin, w.contentW, 12, 6);
        }
        w.y += 2;
        w.doc.setFont("helvetica", "bold");
        w.doc.setFontSize(10);
        w.doc.setTextColor(...palette.accent);
        w.doc.text(t.kit.toUpperCase(), w.margin, w.y);
        w.y += 8;
        if (profile.shortBio) {
          w.doc.setFont("helvetica", "normal");
          w.setInk();
          w.wrapped(profile.shortBio, w.margin, w.contentW, 12, 6);
        }
        const chips = [...profile.primaryNiches, ...profile.languages].filter(Boolean).slice(0, 8);
        if (chips.length) {
          w.y += 4;
          w.doc.setFontSize(9);
          w.doc.text(chips.join("   ·   "), w.margin, w.y);
          w.y += 8;
        }
        w.doc.setFontSize(8);
        w.setInk(true);
        w.doc.text(t.prepared, w.margin, w.pageH - 10);
        w.addPage();
        break;
      }
      case "about": {
        w.heading(t.about);
        if (profile.longBio || profile.shortBio) {
          w.doc.setFont("helvetica", "normal");
          w.setInk();
          w.wrapped(profile.longBio || profile.shortBio, w.margin, w.contentW, 11, 5.5);
        }
        w.y += 4;
        const meta: Array<[string, string]> = [];
        if (profile.country) meta.push([language === "fr" ? "Pays" : "Country", profile.country]);
        if (profile.languages.length) meta.push([language === "fr" ? "Langues" : "Languages", profile.languages.join(", ")]);
        meta.forEach(([label, value]) => {
          w.ensure(12);
          w.labelValue(label, value, w.margin, w.contentW);
          w.y += 2;
        });
        w.y += 6;
        break;
      }
      case "platforms": {
        w.heading(t.platforms);
        for (const p of project.platforms) {
          w.ensure(28);
          w.doc.setFillColor(...palette.card);
          w.doc.roundedRect(w.margin, w.y - 4, w.contentW, 24, 2, 2, "F");
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(12);
          w.setInk();
          w.doc.text(platformName(p, language), w.margin + 4, w.y + 4);
          w.doc.setFont("helvetica", "normal");
          w.doc.setFontSize(9);
          w.setInk(true);
          const handle = p.handle ? `@${p.handle.replace(/^@/, "")}` : "";
          w.doc.text([handle, p.url].filter(Boolean).join("  "), w.margin + 4, w.y + 11);
          const stats = [
            p.followers !== null ? `${t.followers} ${formatCompact(p.followers, language)}` : "",
            p.avgViews !== null ? `${t.views} ${formatCompact(p.avgViews, language)}` : "",
          ]
            .filter(Boolean)
            .join("   ");
          w.doc.setFontSize(9);
          w.setInk();
          if (stats) w.doc.text(stats, w.margin + 4, w.y + 17);
          w.y += 28;
        }
        break;
      }
      case "audienceStats": {
        w.heading(t.stats);
        const totals = aggregateAudience(project.platforms);
        const cards: Array<[string, string]> = [];
        if (totals.followerSum !== null) cards.push([t.followers, formatCompact(totals.followerSum, language)]);
        if (totals.viewsSum !== null) cards.push([t.views, formatCompact(totals.viewsSum, language)]);
        if (totals.impressionsSum !== null) cards.push([t.impressions, formatCompact(totals.impressionsSum, language)]);
        if (totals.reachSum !== null) cards.push([t.reach, formatCompact(totals.reachSum, language)]);
        const colW = w.contentW / Math.max(1, Math.min(4, cards.length));
        const startY = w.y;
        cards.forEach((card, i) => {
          const x = w.margin + i * colW;
          w.doc.setFillColor(...palette.card);
          w.doc.roundedRect(x, startY, colW - 3, 22, 2, 2, "F");
          w.doc.setFontSize(8);
          w.setInk(true);
          w.doc.text(card[0].toUpperCase(), x + 3, startY + 7);
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(14);
          w.setInk();
          w.doc.text(card[1], x + 3, startY + 16);
          w.doc.setFont("helvetica", "normal");
        });
        if (cards.length) w.y = startY + 28;
        w.doc.setFontSize(8);
        w.setInk(true);
        w.wrapped(t.noUnique, w.margin, w.contentW, 8, 4);
        if (project.statsSelfDeclared) w.wrapped(t.self, w.margin, w.contentW, 8, 4);
        for (const p of project.platforms) {
          const eng = platformEngagement(p);
          w.ensure(10);
          w.doc.setFontSize(9);
          w.setInk();
          const rate = eng.rate === null ? t.missing : formatPercent(eng.rate, language);
          const updated = p.statsUpdatedAt ? `  ·  ${p.statsUpdatedAt}` : "";
          w.doc.text(`${platformName(p, language)} — ${t.engagement}: ${rate}${updated}`, w.margin, w.y);
          w.y += 5;
          if (p.statsMethodNote) {
            w.setInk(true);
            w.wrapped(p.statsMethodNote, w.margin, w.contentW, 8, 4);
          }
        }
        w.y += 4;
        break;
      }
      case "audienceProfile": {
        w.heading(t.audience);
        const blocks = [
          [language === "fr" ? "Âge" : "Age", project.audience.ageRanges],
          [language === "fr" ? "Genre" : "Gender", project.audience.genders],
          [language === "fr" ? "Localisation" : "Location", project.audience.locations],
        ] as const;
        for (const [label, rows] of blocks) {
          if (!rows.length) continue;
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(10);
          w.setInk();
          w.doc.text(label, w.margin, w.y);
          w.y += 6;
          for (const row of rows) {
            w.ensure(8);
            w.doc.setFont("helvetica", "normal");
            w.doc.setFontSize(9);
            w.doc.text(`${row.label}  ${row.percent}%`, w.margin, w.y);
            w.doc.setFillColor(...palette.accent);
            const bar = Math.max(0, Math.min(100, row.percent)) * 0.9;
            w.doc.rect(w.margin + 70, w.y - 3, bar, 3, "F");
            w.y += 6;
          }
        }
        if (project.audience.interests.length) {
          w.y += 2;
          w.wrapped(project.audience.interests.join(" · "), w.margin, w.contentW, 10, 5);
        }
        if (project.audience.notes) w.wrapped(project.audience.notes, w.margin, w.contentW, 10, 5);
        w.y += 4;
        break;
      }
      case "niches": {
        w.heading(t.niches);
        if (profile.primaryNiches.length) w.labelValue(t.primary, profile.primaryNiches.join(", "), w.margin, w.contentW);
        if (profile.secondaryNiches.length) w.labelValue(t.secondary, profile.secondaryNiches.join(", "), w.margin, w.contentW);
        w.y += 4;
        break;
      }
      case "performances": {
        w.heading(t.perf);
        for (const p of project.platforms) {
          const eng = platformEngagement(p);
          const line = [
            platformName(p, language),
            p.avgViews !== null ? `${t.views} ${formatCompact(p.avgViews, language)}` : "",
            eng.rate !== null ? `${t.engagement} ${formatPercent(eng.rate, language)}` : "",
            p.postingFrequency,
          ]
            .filter(Boolean)
            .join("  ·  ");
          w.ensure(8);
          w.doc.setFontSize(10);
          w.setInk();
          w.wrapped(line, w.margin, w.contentW, 10, 5);
        }
        w.y += 4;
        break;
      }
      case "examples": {
        w.heading(t.work);
        for (const example of project.examples) {
          if (!example.title && !example.description) continue;
          w.ensure(16);
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(11);
          w.setInk();
          w.doc.text(example.title || example.url, w.margin, w.y);
          w.y += 5;
          w.doc.setFont("helvetica", "normal");
          w.doc.setFontSize(9);
          if (example.description) w.wrapped(example.description, w.margin, w.contentW, 9, 4.5);
          if (example.metricLabel || example.metricValue) {
            w.setInk(true);
            w.wrapped([example.metricLabel, example.metricValue].filter(Boolean).join(": "), w.margin, w.contentW, 9, 4.5);
          }
          if (example.url) {
            w.doc.setTextColor(...palette.accent);
            w.doc.textWithLink(example.url, w.margin, w.y, { url: example.url });
            w.y += 6;
          }
          w.y += 3;
        }
        break;
      }
      case "offers": {
        w.heading(t.offers);
        const offers = project.offers.filter((o) => o.enabled).sort((a, b) => a.order - b.order);
        for (const offer of offers) {
          w.ensure(32);
          w.doc.setDrawColor(...palette.accent);
          w.doc.setLineWidth(0.3);
          w.doc.roundedRect(w.margin, w.y - 4, w.contentW, 8 + 6 * Math.max(1, offer.deliverables.length), 2, 2);
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(12);
          w.setInk();
          w.doc.text(offer.title || (language === "fr" ? "Offre" : "Package"), w.margin + 4, w.y + 2);
          if (offer.price !== null) {
            w.doc.setTextColor(...palette.accent);
            w.doc.text(formatCurrency(offer.price, offer.currency, language), w.pageW - w.margin - 4, w.y + 2, {
              align: "right",
            });
          }
          w.y += 8;
          w.doc.setFont("helvetica", "normal");
          w.doc.setFontSize(9);
          w.setInk();
          if (offer.description) w.wrapped(offer.description, w.margin + 4, w.contentW - 8, 9, 4.5);
          if (offer.deliverables.length) {
            w.wrapped(`${t.deliverables}: ${offer.deliverables.join(", ")}`, w.margin + 4, w.contentW - 8, 9, 4.5);
          }
          const bits = [
            offer.revisions !== null ? `${t.revisions}: ${offer.revisions}` : "",
            offer.usageRights ? `${t.rights}: ${offer.usageRights}` : "",
            offer.turnaround ? `${t.turnaround}: ${offer.turnaround}` : "",
          ].filter(Boolean);
          if (bits.length) w.wrapped(bits.join("  ·  "), w.margin + 4, w.contentW - 8, 8, 4);
          if (offer.conditions) w.wrapped(offer.conditions, w.margin + 4, w.contentW - 8, 8, 4);
          w.y += 8;
        }
        w.doc.setFontSize(8);
        w.setInk(true);
        w.wrapped(t.indicative, w.margin, w.contentW, 8, 4);
        break;
      }
      case "rates": {
        w.heading(t.rates);
        for (const rate of project.rates) {
          const breakdown = calculateIndicativePrice(rate, project.assumptions);
          const platform = project.platforms.find((p) => p.id === rate.platformId);
          const format =
            rate.format === "custom" && rate.customFormat
              ? rate.customFormat
              : FORMAT_LABELS[rate.format]?.[language] ?? rate.format;
          w.ensure(14);
          w.doc.setFont("helvetica", "bold");
          w.doc.setFontSize(10);
          w.setInk();
          const left = [platform ? platformName(platform, language) : "", format].filter(Boolean).join(" · ");
          w.doc.text(left, w.margin, w.y);
          w.doc.setTextColor(...palette.accent);
          const amount = rate.overridePrice ?? breakdown.total;
          w.doc.text(
            breakdown.sufficient
              ? formatCurrency(amount, rate.currency, language)
              : `${formatCurrency(breakdown.low, rate.currency, language)} – ${formatCurrency(breakdown.high, rate.currency, language)}`,
            w.pageW - w.margin,
            w.y,
            { align: "right" },
          );
          w.y += 6;
          w.doc.setFont("helvetica", "normal");
          w.doc.setFontSize(8);
          w.setInk(true);
          if (rate.notes) w.wrapped(rate.notes, w.margin, w.contentW, 8, 4);
        }
        w.wrapped(t.indicative, w.margin, w.contentW, 8, 4);
        break;
      }
      case "contact": {
        w.heading(t.contact);
        const lines = [
          profile.professionalEmail,
          profile.website,
          profile.portfolio,
          ...profile.socialLinks.map((l) => [l.label, l.url].filter(Boolean).join(" — ")),
        ].filter(Boolean);
        for (const line of lines) {
          w.ensure(6);
          w.doc.setFontSize(11);
          w.setInk();
          w.doc.text(String(line), w.margin, w.y);
          w.y += 6;
        }
        w.y += 4;
        break;
      }
      case "terms": {
        w.heading(t.terms);
        w.wrapped(project.terms, w.margin, w.contentW, 10, 5);
        break;
      }
    }
  };

  if (!sections.length) {
    w.doc.setFontSize(16);
    w.setInk();
    w.doc.text(name, w.margin, 40);
    w.doc.setFontSize(11);
    w.wrapped(t.missing, w.margin, w.contentW, 11, 6);
  } else {
    for (const id of sections) {
      await render(id);
    }
  }

  const filename = mediaKitFilename(name);
  const blob = w.doc.output("blob");
  return { blob, filename };
}

export { getTemplate };
