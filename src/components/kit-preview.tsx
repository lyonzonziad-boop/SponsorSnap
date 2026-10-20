"use client";

import { formatCompact, formatCurrency, formatPercent } from "@/lib/format";
import { FONT_OPTIONS } from "@/types";
import { calculateIndicativePrice } from "@/lib/pricing";
import { visibleSectionIds } from "@/lib/sections";
import { aggregateAudience, platformEngagement } from "@/lib/stats";
import { FORMAT_LABELS, PLATFORM_META, SECTION_LABELS } from "@/lib/templates";
import type { Language, MediaKitProject, Platform, SectionId } from "@/types";

function fontStack(id: string): string {
  return FONT_OPTIONS.find((f) => f.id === id)?.stack ?? FONT_OPTIONS[0].stack;
}

function platformLabel(p: Platform, language: Language): string {
  if (p.type === "custom" && p.customName) return p.customName;
  if (p.type === "website") return language === "fr" ? "Site" : "Website";
  return PLATFORM_META[p.type]?.label ?? p.type;
}

function sectionTitle(id: SectionId, language: Language): string {
  return SECTION_LABELS[id]?.[language] ?? id;
}

function SliceChart({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; percent: number }[];
}) {
  if (!rows.length) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div key={row.id}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{row.label}</span>
              <span>{row.percent}%</span>
            </div>
            <div className="bar" aria-hidden="true">
              <span style={{ width: `${Math.max(0, Math.min(100, row.percent))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MediaKitPreview({
  project,
  language,
}: {
  project: MediaKitProject;
  language: Language;
}) {
  const sections = visibleSectionIds(project);
  const accent = project.appearance.accentColor || project.profile.brandColor || "#5B4CFF";
  const font = fontStack(project.appearance.fontFamily || project.profile.fontFamily);
  const totals = aggregateAudience(project.platforms);
  const name = project.profile.publicName || project.profile.brandName || "—";
  const fr = language === "fr";

  const pages: SectionId[][] = [];
  let current: SectionId[] = [];
  for (const id of sections) {
    if (id === "cover" && current.length) {
      pages.push(current);
      current = [];
    }
    current.push(id);
    if (id === "cover") {
      pages.push(current);
      current = [];
    }
  }
  if (current.length) pages.push(current);
  if (!pages.length) pages.push([]);

  return (
    <div
      className={`kit kit-${project.appearance.templateId} kit-stage`}
      style={{ ["--kit-accent" as string]: accent, fontFamily: font }}
    >
      {pages.map((page, pageIndex) => (
        <article className="kit-page" key={`page-${pageIndex}`} aria-label={`A4 ${pageIndex + 1}`}>
          {page.length === 0 ? (
            <p className="text-sm opacity-70">
              {fr
                ? "Aucune section à afficher. Ajoutez un nom, une bio ou une plateforme."
                : "Nothing to display yet. Add a name, bio or platform."}
            </p>
          ) : null}
          {page.map((id) => (
            <section key={id} className="mb-6">
              {id === "cover" ? (
                <div className="grid gap-6 md:grid-cols-[1fr_120px]">
                  <div>
                    {project.profile.logoDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.profile.logoDataUrl} alt="" className="mb-4 h-12 w-12 object-contain" />
                    ) : null}
                    <p className="kit-kicker" style={{ color: accent }}>
                      {fr ? "Media kit" : "Media kit"}
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold">{name}</h1>
                    {project.profile.brandName && project.profile.brandName !== project.profile.publicName ? (
                      <p className="mt-1 text-lg opacity-70">{project.profile.brandName}</p>
                    ) : null}
                    {project.profile.shortBio ? <p className="mt-4 max-w-xl text-[15px] leading-6">{project.profile.shortBio}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.profile.primaryNiches.map((n) => (
                        <span className="kit-chip" key={n}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                  {project.profile.photoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.profile.photoDataUrl}
                      alt={fr ? `Photo de ${name}` : `Photo of ${name}`}
                      className="h-28 w-28 rounded-full object-cover"
                    />
                  ) : null}
                </div>
              ) : null}

              {id !== "cover" ? (
                <h2 className="mb-3 text-xl font-semibold" style={{ color: accent }}>
                  {sectionTitle(id, language)}
                </h2>
              ) : null}

              {id === "about" ? (
                <div>
                  <p className="whitespace-pre-wrap text-[14px] leading-6">
                    {project.profile.longBio || project.profile.shortBio}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-80">
                    {project.profile.country ? <span>{project.profile.country}</span> : null}
                    {project.profile.languages.length ? <span>{project.profile.languages.join(", ")}</span> : null}
                  </div>
                </div>
              ) : null}

              {id === "platforms" ? (
                <div className="grid gap-3">
                  {project.platforms.map((p) => (
                    <div className="kit-card rounded-xl border border-black/10 p-3" key={p.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <strong>{platformLabel(p, language)}</strong>
                        {p.followers !== null ? <span>{formatCompact(p.followers, language)}</span> : null}
                      </div>
                      <p className="mt-1 text-xs opacity-70">
                        {[p.handle ? `@${p.handle.replace(/^@/, "")}` : "", p.url].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {id === "audienceStats" ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {totals.followerSum !== null ? (
                      <Stat label={fr ? "Abonnés (somme)" : "Followers (sum)"} value={formatCompact(totals.followerSum, language)} />
                    ) : null}
                    {totals.viewsSum !== null ? (
                      <Stat label={fr ? "Vues moy. (somme)" : "Avg. views (sum)"} value={formatCompact(totals.viewsSum, language)} />
                    ) : null}
                    {totals.impressionsSum !== null ? (
                      <Stat label={fr ? "Impressions" : "Impressions"} value={formatCompact(totals.impressionsSum, language)} />
                    ) : null}
                    {totals.reachSum !== null ? (
                      <Stat label={fr ? "Portée" : "Reach"} value={formatCompact(totals.reachSum, language)} />
                    ) : null}
                  </div>
                  <p className="mt-3 text-[11px] opacity-70">
                    {fr
                      ? "Les totaux additionnent les comptes listés, pas des personnes uniques."
                      : "Totals add listed accounts, not unique people."}
                  </p>
                  {project.statsSelfDeclared ? (
                    <p className="text-[11px] opacity-70">
                      {fr
                        ? "Chiffres déclarés par le créateur, non vérifiés indépendamment."
                        : "Figures declared by the creator and not independently verified."}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {id === "audienceProfile" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <SliceChart title={fr ? "Âge" : "Age"} rows={project.audience.ageRanges} />
                  <SliceChart title={fr ? "Genre" : "Gender"} rows={project.audience.genders} />
                  <SliceChart title={fr ? "Localisation" : "Location"} rows={project.audience.locations} />
                  {project.audience.interests.length ? (
                    <p className="md:col-span-3 text-sm">{project.audience.interests.join(" · ")}</p>
                  ) : null}
                </div>
              ) : null}

              {id === "niches" ? (
                <div className="flex flex-wrap gap-2">
                  {project.profile.primaryNiches.map((n) => (
                    <span className="kit-chip" key={`p-${n}`}>
                      {n}
                    </span>
                  ))}
                  {project.profile.secondaryNiches.map((n) => (
                    <span className="kit-chip opacity-70" key={`s-${n}`}>
                      {n}
                    </span>
                  ))}
                </div>
              ) : null}

              {id === "performances" ? (
                <div className="grid gap-2 text-sm">
                  {project.platforms.map((p) => {
                    const eng = platformEngagement(p);
                    return (
                      <div key={p.id}>
                        <strong>{platformLabel(p, language)}</strong>
                        <span className="opacity-80">
                          {" "}
                          {p.avgViews !== null ? `${fr ? "Vues" : "Views"} ${formatCompact(p.avgViews, language)}` : ""}
                          {eng.rate !== null ? ` · ${formatPercent(eng.rate, language)}` : ""}
                          {p.statsUpdatedAt ? ` · ${p.statsUpdatedAt}` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {id === "examples" ? (
                <div className="grid gap-3">
                  {project.examples.map((example) => (
                    <div key={example.id}>
                      <strong>{example.title}</strong>
                      {example.description ? <p className="text-sm opacity-80">{example.description}</p> : null}
                      {example.metricValue ? (
                        <p className="text-xs">
                          {example.metricLabel} {example.metricValue}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {id === "offers" ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {project.offers
                    .filter((o) => o.enabled)
                    .sort((a, b) => a.order - b.order)
                    .map((offer) => (
                      <div className="kit-card rounded-xl border border-black/10 p-3" key={offer.id}>
                        <h3 className="text-base font-semibold">{offer.title}</h3>
                        {offer.price !== null ? (
                          <p className="mt-1 text-lg font-semibold" style={{ color: accent }}>
                            {formatCurrency(offer.price, offer.currency, language)}
                          </p>
                        ) : null}
                        {offer.description ? <p className="mt-2 text-sm opacity-80">{offer.description}</p> : null}
                        {offer.deliverables.length ? (
                          <ul className="mt-2 list-disc pl-4 text-sm">
                            {offer.deliverables.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                </div>
              ) : null}

              {id === "rates" ? (
                <div className="grid gap-2 text-sm">
                  {project.rates.map((rate) => {
                    const breakdown = calculateIndicativePrice(rate, project.assumptions);
                    const platform = project.platforms.find((p) => p.id === rate.platformId);
                    const format =
                      rate.format === "custom" && rate.customFormat
                        ? rate.customFormat
                        : FORMAT_LABELS[rate.format]?.[language] ?? rate.format;
                    return (
                      <div className="flex justify-between gap-3" key={rate.id}>
                        <span>
                          {platform ? platformLabel(platform, language) : ""} {format}
                        </span>
                        <strong>
                          {breakdown.sufficient
                            ? formatCurrency(rate.overridePrice ?? breakdown.total, rate.currency, language)
                            : `${formatCurrency(breakdown.low, rate.currency, language)} – ${formatCurrency(breakdown.high, rate.currency, language)}`}
                        </strong>
                      </div>
                    );
                  })}
                  {project.ratesIndicative ? (
                    <p className="text-[11px] opacity-70">
                      {fr ? "Tarifs indicatifs. Ceci n’est pas une offre contractuelle." : "Indicative rates. Not a contractual offer."}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {id === "contact" ? (
                <div className="text-sm leading-6">
                  {project.profile.professionalEmail ? <div>{project.profile.professionalEmail}</div> : null}
                  {project.profile.website ? <div>{project.profile.website}</div> : null}
                  {project.profile.portfolio ? <div>{project.profile.portfolio}</div> : null}
                  {project.profile.socialLinks.map((link) => (
                    <div key={link.id}>
                      {link.label} {link.url}
                    </div>
                  ))}
                </div>
              ) : null}

              {id === "terms" ? <p className="whitespace-pre-wrap text-sm">{project.terms}</p> : null}
            </section>
          ))}
        </article>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="kit-card rounded-xl border border-black/10 p-3">
      <div className="text-[11px] uppercase tracking-wide opacity-60">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
