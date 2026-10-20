"use client";

import { useMemo, useState } from "react";
import { Button, FieldGrid, Input, Label, Select, Textarea } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { createId } from "@/lib/id";
import { formatCurrency } from "@/lib/format";
import { calculateIndicativePrice, resetAssumptions } from "@/lib/pricing";
import { FORMAT_LABELS, PLATFORM_META } from "@/lib/templates";
import type { ContentFormat, IndicativeRate } from "@/types";
import { NeedProject } from "@/components/forms";

const emptyRate = (currency: string, platformId: string): IndicativeRate => ({
  id: createId("rate"),
  platformId,
  format: "short_video",
  customFormat: "",
  deliverableCount: 1,
  avgViews: null,
  productionEffort: 1,
  complexity: 1,
  turnaroundDays: 7,
  revisionsIncluded: 1,
  extraRevisions: 0,
  usageRightsLevel: 0,
  exclusivityLevel: 0,
  rush: false,
  minimumBudget: null,
  currency,
  overridePrice: null,
  notes: "",
});

export function PricingPanel() {
  const { active, updateActive, t, language, settings, notify } = useApp();
  const [draft, setDraft] = useState<IndicativeRate>(() => emptyRate(settings.defaultCurrency, ""));

  const rate = useMemo(() => {
    if (!active) return draft;
    return {
      ...draft,
      platformId: draft.platformId || active.platforms[0]?.id || "",
      currency: draft.currency || settings.defaultCurrency,
    };
  }, [active, draft, settings.defaultCurrency]);

  if (!active) return <NeedProject t={t} />;

  const breakdown = calculateIndicativePrice(rate, active.assumptions);

  const set = (patch: Partial<IndicativeRate>) => setDraft((prev) => ({ ...prev, ...patch }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="ss-card p-5">
        <p className="mt-0 text-sm text-[var(--ink-soft)]">{t.pricing.intro}</p>
        <FieldGrid>
          <Label label={t.pricing.platform}>
            <Select value={rate.platformId} onChange={(e) => set({ platformId: e.target.value })}>
              <option value="">{t.common.none}</option>
              {active.platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.type === "custom" && p.customName ? p.customName : PLATFORM_META[p.type]?.label}
                </option>
              ))}
            </Select>
          </Label>
          <Label label={t.pricing.format}>
            <Select value={rate.format} onChange={(e) => set({ format: e.target.value as ContentFormat })}>
              {Object.entries(FORMAT_LABELS).map(([key, labels]) => (
                <option key={key} value={key}>
                  {labels[language]}
                </option>
              ))}
            </Select>
          </Label>
          {rate.format === "custom" ? (
            <Label label={t.pricing.customFormat}>
              <Input value={rate.customFormat} onChange={(e) => set({ customFormat: e.target.value })} />
            </Label>
          ) : null}
          <Label label={t.pricing.deliverables}>
            <Input
              type="number"
              min={1}
              value={rate.deliverableCount}
              onChange={(e) => set({ deliverableCount: Number(e.target.value) || 1 })}
            />
          </Label>
          <Label label={t.pricing.avgViews}>
            <Input
              inputMode="decimal"
              value={rate.avgViews ?? ""}
              onChange={(e) => set({ avgViews: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.effort}>
            <Input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={rate.productionEffort}
              onChange={(e) => set({ productionEffort: Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.complexity}>
            <Input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={rate.complexity}
              onChange={(e) => set({ complexity: Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.turnaround}>
            <Input
              type="number"
              value={rate.turnaroundDays ?? ""}
              onChange={(e) => set({ turnaroundDays: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.revisions}>
            <Input
              type="number"
              value={rate.revisionsIncluded}
              onChange={(e) => set({ revisionsIncluded: Number(e.target.value) || 0 })}
            />
          </Label>
          <Label label={t.pricing.extraRevisions}>
            <Input
              type="number"
              value={rate.extraRevisions}
              onChange={(e) => set({ extraRevisions: Number(e.target.value) || 0 })}
            />
          </Label>
          <Label label={t.pricing.usage}>
            <Input
              type="range"
              min={0}
              max={4}
              step={1}
              value={rate.usageRightsLevel}
              onChange={(e) => set({ usageRightsLevel: Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.exclusivity}>
            <Input
              type="range"
              min={0}
              max={3}
              step={1}
              value={rate.exclusivityLevel}
              onChange={(e) => set({ exclusivityLevel: Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.minimum}>
            <Input
              inputMode="decimal"
              value={rate.minimumBudget ?? ""}
              onChange={(e) => set({ minimumBudget: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Label>
          <Label label={t.pricing.currency}>
            <Input value={rate.currency} onChange={(e) => set({ currency: e.target.value.toUpperCase() })} />
          </Label>
          <Label label={t.pricing.override}>
            <Input
              inputMode="decimal"
              value={rate.overridePrice ?? ""}
              onChange={(e) => set({ overridePrice: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Label>
        </FieldGrid>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={rate.rush} onChange={(e) => set({ rush: e.target.checked })} />
          {t.pricing.rush}
        </label>
        <Label label={t.pricing.notes}>
          <Textarea value={rate.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Label>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => {
              updateActive((project) => ({ ...project, rates: [...project.rates, { ...rate, id: createId("rate") }] }));
              notify(t.pricing.added);
            }}
          >
            {t.pricing.addToKit}
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.pricing.result}</h2>
          <p className="text-3xl font-semibold tracking-tight">
            {formatCurrency(breakdown.total, rate.currency, language)}
          </p>
          <p className="text-sm text-[var(--ink-soft)]">
            {t.pricing.range}: {formatCurrency(breakdown.low, rate.currency, language)} –{" "}
            {formatCurrency(breakdown.high, rate.currency, language)}
          </p>
          {!breakdown.sufficient ? <p className="text-sm">{t.pricing.notEnough}</p> : null}
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              {t.pricing.production}: {formatCurrency(breakdown.production, rate.currency, language)}
            </li>
            <li>
              {t.pricing.audience}: {formatCurrency(breakdown.audience, rate.currency, language)}
            </li>
            <li>
              {t.pricing.factors}: ×{breakdown.complexityFactor} complexity · ×{breakdown.usageFactor} usage · ×
              {breakdown.exclusivityFactor} exclusivity
              {rate.rush ? ` · ×${breakdown.rushFactor} rush` : ""}
            </li>
          </ul>
          <p className="text-xs text-[var(--ink-soft)]">{t.pricing.noGuarantee}</p>
        </div>
        <div className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.pricing.assumptions}</h2>
          <p className="text-sm text-[var(--ink-soft)]">{t.pricing.intro}</p>
          {(
            [
              ["productionBase", t.pricing.productionBase],
              ["audienceCpm", t.pricing.audienceCpm],
              ["complexityWeight", t.pricing.complexityWeight],
              ["usageRightsWeight", t.pricing.usageWeight],
              ["exclusivityWeight", t.pricing.exclusivityWeight],
              ["revisionFee", t.pricing.revisionFee],
              ["rushMultiplier", t.pricing.rushMultiplier],
            ] as const
          ).map(([key, label]) => (
            <Label key={key} label={label}>
              <Input
                type="number"
                step="0.1"
                value={active.assumptions[key]}
                onChange={(e) =>
                  updateActive((project) => ({
                    ...project,
                    assumptions: { ...project.assumptions, [key]: Number(e.target.value) },
                  }))
                }
              />
            </Label>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => updateActive((project) => ({ ...project, assumptions: resetAssumptions() }))}
          >
            {t.pricing.reset}
          </Button>
        </div>
      </div>
    </div>
  );
}
