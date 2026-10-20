"use client";

import { createId } from "@/lib/id";
import { fileToDataUrl } from "@/lib/image";
import { PLATFORM_META } from "@/lib/templates";
import { validateImageFile, validatePlatformUrl } from "@/lib/validation";
import { emptyPlatform } from "@/lib/project";
import type { Dictionary } from "@/i18n";
import type { AudienceProfile, CreatorProfile, MediaKitProject, Platform, PlatformType, PricingOffer } from "@/types";
import { FONT_OPTIONS } from "@/types";
import { Button, FieldGrid, Input, Label, Select, Textarea } from "@/components/ui";
import { platformEngagement } from "@/lib/stats";
import { formatPercent } from "@/lib/format";
import type { Language } from "@/types";

function csv(values: string[]): string {
  return values.join(", ");
}
function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function onImage(
  file: File | undefined,
  t: Dictionary,
  notify: (text: string) => void,
  apply: (url: string) => void,
) {
  if (!file) return;
  const issue = validateImageFile(file);
  if (issue?.message === "unsupported_image") {
    notify(t.toast.imageInvalid);
    return;
  }
  if (issue?.message === "image_too_large") {
    notify(t.toast.imageLarge);
    return;
  }
  apply(await fileToDataUrl(file));
}

export function ProfileForm({
  profile,
  t,
  notify,
  onChange,
}: {
  profile: CreatorProfile;
  t: Dictionary;
  notify: (text: string) => void;
  onChange: (profile: CreatorProfile) => void;
}) {
  const set = (patch: Partial<CreatorProfile>) => onChange({ ...profile, ...patch });

  return (
    <div className="grid gap-5">
      <FieldGrid>
        <Label label={t.profile.publicName}>
          <Input value={profile.publicName} onChange={(e) => set({ publicName: e.target.value })} />
        </Label>
        <Label label={t.profile.brandName}>
          <Input value={profile.brandName} onChange={(e) => set({ brandName: e.target.value })} />
        </Label>
      </FieldGrid>
      <FieldGrid>
        <ImageField
          label={t.profile.photo}
          hint={t.profile.imageHint}
          src={profile.photoDataUrl}
          alt=""
          uploadLabel={t.profile.upload}
          removeLabel={t.profile.removeImage}
          onUpload={(file) => void onImage(file, t, notify, (url) => set({ photoDataUrl: url }))}
          onRemove={() => set({ photoDataUrl: "" })}
        />
        <ImageField
          label={t.profile.logo}
          hint={t.profile.imageHint}
          src={profile.logoDataUrl}
          alt=""
          uploadLabel={t.profile.upload}
          removeLabel={t.profile.removeImage}
          onUpload={(file) => void onImage(file, t, notify, (url) => set({ logoDataUrl: url }))}
          onRemove={() => set({ logoDataUrl: "" })}
        />
      </FieldGrid>
      <Label label={t.profile.shortBio}>
        <Textarea value={profile.shortBio} onChange={(e) => set({ shortBio: e.target.value })} />
      </Label>
      <Label label={t.profile.longBio}>
        <Textarea value={profile.longBio} onChange={(e) => set({ longBio: e.target.value })} />
      </Label>
      <FieldGrid>
        <Label label={t.profile.country}>
          <Input value={profile.country} onChange={(e) => set({ country: e.target.value })} />
        </Label>
        <Label label={t.profile.languages} hint={t.profile.languagesHint}>
          <Input value={csv(profile.languages)} onChange={(e) => set({ languages: fromCsv(e.target.value) })} />
        </Label>
        <Label label={t.profile.primaryNiches} hint={t.profile.languagesHint}>
          <Input value={csv(profile.primaryNiches)} onChange={(e) => set({ primaryNiches: fromCsv(e.target.value) })} />
        </Label>
        <Label label={t.profile.secondaryNiches} hint={t.profile.languagesHint}>
          <Input value={csv(profile.secondaryNiches)} onChange={(e) => set({ secondaryNiches: fromCsv(e.target.value) })} />
        </Label>
        <Label label={t.profile.email}>
          <Input type="email" value={profile.professionalEmail} onChange={(e) => set({ professionalEmail: e.target.value })} />
        </Label>
        <Label label={t.profile.website}>
          <Input value={profile.website} onChange={(e) => set({ website: e.target.value })} />
        </Label>
        <Label label={t.profile.portfolio}>
          <Input value={profile.portfolio} onChange={(e) => set({ portfolio: e.target.value })} />
        </Label>
        <Label label={t.profile.font}>
          <Select value={profile.fontFamily} onChange={(e) => set({ fontFamily: e.target.value })}>
            {FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </Select>
        </Label>
        <Label label={t.profile.brandColor}>
          <Input type="color" value={profile.brandColor} onChange={(e) => set({ brandColor: e.target.value })} />
        </Label>
        <Label label={t.profile.secondaryColor}>
          <Input type="color" value={profile.secondaryColor} onChange={(e) => set({ secondaryColor: e.target.value })} />
        </Label>
      </FieldGrid>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="m-0 text-sm font-semibold">{t.profile.socialLinks}</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => set({ socialLinks: [...profile.socialLinks, { id: createId("lnk"), label: "", url: "" }] })}
          >
            {t.profile.addLink}
          </Button>
        </div>
        <div className="grid gap-3">
          {profile.socialLinks.map((link) => (
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={link.id}>
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) =>
                  set({
                    socialLinks: profile.socialLinks.map((item) => (item.id === link.id ? { ...item, label: e.target.value } : item)),
                  })
                }
              />
              <Input
                placeholder="https://"
                value={link.url}
                onChange={(e) =>
                  set({
                    socialLinks: profile.socialLinks.map((item) => (item.id === link.id ? { ...item, url: e.target.value } : item)),
                  })
                }
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => set({ socialLinks: profile.socialLinks.filter((item) => item.id !== link.id) })}
              >
                {t.profile.removeImage}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageField({
  label,
  hint,
  src,
  alt,
  uploadLabel,
  removeLabel,
  onUpload,
  onRemove,
}: {
  label: string;
  hint: string;
  src: string;
  alt: string;
  uploadLabel: string;
  removeLabel: string;
  onUpload: (file: File | undefined) => void;
  onRemove: () => void;
}) {
  return (
    <div className="ss-label">
      <span>{label}</span>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-24 w-24 rounded-2xl object-cover" />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className="ss-btn ss-btn-secondary cursor-pointer">
          {uploadLabel}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>
        {src ? (
          <Button type="button" variant="ghost" onClick={onRemove}>
            {removeLabel}
          </Button>
        ) : null}
      </div>
      <span className="ss-hint">{hint}</span>
    </div>
  );
}

export function PlatformsForm({
  platforms,
  t,
  language,
  notify,
  onChange,
}: {
  platforms: Platform[];
  t: Dictionary;
  language: Language;
  notify: (text: string) => void;
  onChange: (platforms: Platform[]) => void;
}) {
  const update = (id: string, patch: Partial<Platform>) =>
    onChange(platforms.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="grid gap-4">
      <p className="m-0 text-sm text-[var(--ink-soft)]">{t.platforms.noAuto}</p>
      <div>
        <Button type="button" onClick={() => onChange([...platforms, emptyPlatform()])}>
          {t.platforms.add}
        </Button>
      </div>
      {platforms.length === 0 ? <p className="text-[var(--ink-soft)]">{t.platforms.empty}</p> : null}
      {platforms.map((p) => {
        const urlIssue = validatePlatformUrl(p.url);
        const eng = platformEngagement(p);
        return (
          <div className="ss-card p-4" key={p.id}>
            <FieldGrid>
              <Label label={t.platforms.type}>
                <Select value={p.type} onChange={(e) => update(p.id, { type: e.target.value as PlatformType })}>
                  {Object.entries(PLATFORM_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </Select>
              </Label>
              {p.type === "custom" ? (
                <Label label={t.platforms.customName}>
                  <Input value={p.customName} onChange={(e) => update(p.id, { customName: e.target.value })} />
                </Label>
              ) : (
                <span />
              )}
              <Label label={t.platforms.url} error={urlIssue ? t.toast.invalidUrl : undefined}>
                <Input value={p.url} onChange={(e) => update(p.id, { url: e.target.value })} />
              </Label>
              <Label label={t.platforms.handle}>
                <Input value={p.handle} onChange={(e) => update(p.id, { handle: e.target.value })} />
              </Label>
              <NumberField label={t.platforms.followers} value={p.followers} onChange={(v) => update(p.id, { followers: v })} />
              <NumberField label={t.platforms.avgViews} value={p.avgViews} onChange={(v) => update(p.id, { avgViews: v })} />
              <NumberField label={t.platforms.avgImpressions} value={p.avgImpressions} onChange={(v) => update(p.id, { avgImpressions: v })} />
              <NumberField label={t.platforms.avgReach} value={p.avgReach} onChange={(v) => update(p.id, { avgReach: v })} />
              <NumberField label={t.platforms.interactions} value={p.interactions} onChange={(v) => update(p.id, { interactions: v })} />
              <Label label={t.platforms.method}>
                <Select
                  value={p.engagementMethod}
                  onChange={(e) => update(p.id, { engagementMethod: e.target.value as Platform["engagementMethod"] })}
                >
                  <option value="followers">{t.platforms.methodFollowers}</option>
                  <option value="reach">{t.platforms.methodReach}</option>
                  <option value="impressions">{t.platforms.methodImpressions}</option>
                </Select>
              </Label>
              <Label label={t.platforms.frequency}>
                <Input value={p.postingFrequency} onChange={(e) => update(p.id, { postingFrequency: e.target.value })} />
              </Label>
              <Label label={t.platforms.updatedAt}>
                <Input type="date" value={p.statsUpdatedAt} onChange={(e) => update(p.id, { statsUpdatedAt: e.target.value })} />
              </Label>
            </FieldGrid>
            <Label label={t.platforms.methodNote}>
              <Textarea value={p.statsMethodNote} onChange={(e) => update(p.id, { statsMethodNote: e.target.value })} />
            </Label>
            <p className="mt-3 text-sm">
              {t.platforms.engagement}:{" "}
              <strong>{eng.rate === null ? t.platforms.insufficient : formatPercent(eng.rate, language)}</strong>
              <span className="ml-2 text-[var(--ink-soft)]">
                {t.platforms.formula}: {eng.formula}
              </span>
            </p>
            {p.url && !urlIssue ? (
              <a className="mt-2 inline-block text-sm" href={p.url} target="_blank" rel="noreferrer">
                {t.platforms.openProfile}
              </a>
            ) : null}
            <div className="mt-3">
              <Button type="button" variant="danger" onClick={() => onChange(platforms.filter((item) => item.id !== p.id))}>
                {t.platforms.remove}
              </Button>
            </div>
          </div>
        );
      })}
      <p className="text-sm text-[var(--ink-soft)]">{t.platforms.totalsNote}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <Label label={label}>
      <Input
        inputMode="decimal"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const n = Number(raw);
          onChange(Number.isFinite(n) ? n : null);
        }}
      />
    </Label>
  );
}

export function AudienceForm({
  audience,
  t,
  onChange,
}: {
  audience: AudienceProfile;
  t: Dictionary;
  onChange: (audience: AudienceProfile) => void;
}) {
  return (
    <div className="grid gap-6">
      <h3 className="m-0 text-lg font-semibold">{t.platforms.audienceTitle}</h3>
      <SliceEditor title={t.platforms.ages} rows={audience.ageRanges} t={t} onChange={(ageRanges) => onChange({ ...audience, ageRanges })} />
      <SliceEditor title={t.platforms.genders} rows={audience.genders} t={t} onChange={(genders) => onChange({ ...audience, genders })} />
      <SliceEditor title={t.platforms.locations} rows={audience.locations} t={t} onChange={(locations) => onChange({ ...audience, locations })} />
      <Label label={t.platforms.interests} hint={t.profile.languagesHint}>
        <Input value={audience.interests.join(", ")} onChange={(e) => onChange({ ...audience, interests: fromCsv(e.target.value) })} />
      </Label>
      <Label label={t.platforms.notes}>
        <Textarea value={audience.notes} onChange={(e) => onChange({ ...audience, notes: e.target.value })} />
      </Label>
    </div>
  );
}

function SliceEditor({
  title,
  rows,
  t,
  onChange,
}: {
  title: string;
  rows: AudienceProfile["ageRanges"];
  t: Dictionary;
  onChange: (rows: AudienceProfile["ageRanges"]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="m-0 text-sm font-semibold">{title}</h4>
        <Button
          type="button"
          variant="secondary"
          onClick={() => onChange([...rows, { id: createId("slc"), label: "", percent: 0 }])}
        >
          {t.platforms.addSlice}
        </Button>
      </div>
      <div className="grid gap-2">
        {rows.map((row) => (
          <div className="grid grid-cols-[1fr_100px_auto] gap-2" key={row.id}>
            <Input
              value={row.label}
              onChange={(e) => onChange(rows.map((item) => (item.id === row.id ? { ...item, label: e.target.value } : item)))}
            />
            <Input
              inputMode="decimal"
              value={row.percent}
              onChange={(e) =>
                onChange(rows.map((item) => (item.id === row.id ? { ...item, percent: Number(e.target.value) || 0 } : item)))
              }
              aria-label={t.platforms.percent}
            />
            <Button type="button" variant="ghost" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffersForm({
  offers,
  t,
  currency,
  onChange,
}: {
  offers: PricingOffer[];
  t: Dictionary;
  currency: string;
  onChange: (offers: PricingOffer[]) => void;
}) {
  const update = (id: string, patch: Partial<PricingOffer>) =>
    onChange(offers.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="grid gap-4">
      <p className="m-0 text-sm text-[var(--ink-soft)]">{t.offers.disclaimer}</p>
      <Button
        type="button"
        onClick={() =>
          onChange([
            ...offers,
            {
              id: createId("off"),
              title: "Custom",
              description: "",
              price: null,
              currency,
              deliverables: [],
              revisions: 1,
              usageRights: "",
              turnaround: "",
              conditions: "",
              enabled: true,
              order: offers.length,
            },
          ])
        }
      >
        {t.offers.add}
      </Button>
      {offers.length === 0 ? <p>{t.offers.empty}</p> : null}
      {offers
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((offer, index) => (
          <div className="ss-card p-4" key={offer.id}>
            <FieldGrid>
              <Label label={t.offers.name}>
                <Input value={offer.title} onChange={(e) => update(offer.id, { title: e.target.value })} />
              </Label>
              <NumberField label={t.offers.price} value={offer.price} onChange={(v) => update(offer.id, { price: v })} />
              <Label label={t.offers.currency}>
                <Input value={offer.currency} onChange={(e) => update(offer.id, { currency: e.target.value.toUpperCase() })} />
              </Label>
              <NumberField label={t.offers.revisions} value={offer.revisions} onChange={(v) => update(offer.id, { revisions: v })} />
              <Label label={t.offers.rights}>
                <Input value={offer.usageRights} onChange={(e) => update(offer.id, { usageRights: e.target.value })} />
              </Label>
              <Label label={t.offers.turnaround}>
                <Input value={offer.turnaround} onChange={(e) => update(offer.id, { turnaround: e.target.value })} />
              </Label>
            </FieldGrid>
            <Label label={t.offers.description}>
              <Textarea value={offer.description} onChange={(e) => update(offer.id, { description: e.target.value })} />
            </Label>
            <Label label={t.offers.deliverables} hint={t.offers.deliverablesHint}>
              <Textarea
                value={offer.deliverables.join("\n")}
                onChange={(e) =>
                  update(offer.id, {
                    deliverables: e.target.value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Label>
            <Label label={t.offers.conditions}>
              <Textarea value={offer.conditions} onChange={(e) => update(offer.id, { conditions: e.target.value })} />
            </Label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={offer.enabled} onChange={(e) => update(offer.id, { enabled: e.target.checked })} />
              {t.offers.enabled}
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={index === 0}
                onClick={() => {
                  const sorted = offers.slice().sort((a, b) => a.order - b.order);
                  const current = sorted[index];
                  const prev = sorted[index - 1];
                  if (!current || !prev) return;
                  onChange(
                    offers.map((o) => {
                      if (o.id === current.id) return { ...o, order: prev.order };
                      if (o.id === prev.id) return { ...o, order: current.order };
                      return o;
                    }),
                  );
                }}
              >
                {t.offers.moveUp}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  onChange([
                    ...offers,
                    {
                      ...offer,
                      id: createId("off"),
                      title: `${offer.title} copy`,
                      order: offers.length,
                    },
                  ])
                }
              >
                {t.offers.duplicate}
              </Button>
              <Button type="button" variant="danger" onClick={() => onChange(offers.filter((o) => o.id !== offer.id))}>
                {t.offers.remove}
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
}

export function NeedProject({ t }: { t: Dictionary }) {
  return (
    <div className="ss-card p-8">
      <p className="m-0">{t.common.needProject}</p>
      <a className="ss-btn ss-btn-primary mt-4 inline-flex" href="/kits/new">
        {t.dashboard.create}
      </a>
    </div>
  );
}

export function ExamplesForm({
  project,
  t,
  onChange,
}: {
  project: MediaKitProject;
  t: Dictionary;
  onChange: (project: MediaKitProject) => void;
}) {
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          onChange({
            ...project,
            examples: [
              ...project.examples,
              { id: createId("ex"), title: "", url: "", description: "", metricLabel: "", metricValue: "" },
            ],
          })
        }
      >
        {t.profile.addLink}
      </Button>
      {project.examples.map((example) => (
        <div className="ss-card p-4" key={example.id}>
          <FieldGrid>
            <Label label={t.offers.name}>
              <Input
                value={example.title}
                onChange={(e) =>
                  onChange({
                    ...project,
                    examples: project.examples.map((item) => (item.id === example.id ? { ...item, title: e.target.value } : item)),
                  })
                }
              />
            </Label>
            <Label label="URL">
              <Input
                value={example.url}
                onChange={(e) =>
                  onChange({
                    ...project,
                    examples: project.examples.map((item) => (item.id === example.id ? { ...item, url: e.target.value } : item)),
                  })
                }
              />
            </Label>
          </FieldGrid>
          <Label label={t.offers.description}>
            <Textarea
              value={example.description}
              onChange={(e) =>
                onChange({
                  ...project,
                  examples: project.examples.map((item) =>
                    item.id === example.id ? { ...item, description: e.target.value } : item,
                  ),
                })
              }
            />
          </Label>
        </div>
      ))}
    </div>
  );
}
