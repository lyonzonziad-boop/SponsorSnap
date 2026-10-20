"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AudienceForm, OffersForm, PlatformsForm, ProfileForm } from "@/components/forms";
import { MediaKitPreview } from "@/components/kit-preview";
import { PricingPanel } from "@/components/pricing-panel";
import { PageHeader } from "@/components/shell";
import { Button, Input, Label } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportProjectPdf } from "@/lib/client-export";
import { TEMPLATES } from "@/lib/templates";
import type { TemplateId } from "@/types";
import { Suspense } from "react";

function WizardInner() {
  const { t, language, ready, active, createKit, setActiveId, updateActive, saveNow, notify } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const started = useRef(false);
  const [step, setStep] = useState(0);
  const requestedId = params.get("id");

  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    if (requestedId) {
      setActiveId(requestedId);
      return;
    }
    void createKit().then((project) => {
      setActiveId(project.id);
      router.replace(`/kits/new?id=${project.id}`);
    });
  }, [ready, requestedId, createKit, setActiveId, router]);

  const steps = t.wizard.steps;
  const max = steps.length - 1;
  const project = active;

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step, steps.length]);

  if (!project) {
    return <p>{t.common.loading}</p>;
  }

  return (
    <div>
      <PageHeader
        title={t.wizard.title}
        subtitle={`${steps[step]} · ${step + 1}/${steps.length}`}
        actions={
          <Button type="button" variant="secondary" onClick={() => void saveNow()}>
            {t.wizard.saveDraft}
          </Button>
        }
      />
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]" aria-hidden="true">
        <div className="h-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              className={`rounded-full px-3 py-1 ${index === step ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-soft)]"}`}
              onClick={() => setStep(index)}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="ss-card p-5">
        {step === 0 ? (
          <div>
            <Label label={t.wizard.projectName}>
              <Input value={project.name} onChange={(e) => updateActive((p) => ({ ...p, name: e.target.value }))} />
            </Label>
            <p className="text-sm text-[var(--ink-soft)]">{t.wizard.chooseTemplate}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={`overflow-hidden rounded-2xl border text-left ${
                    project.appearance.templateId === template.id ? "border-[var(--accent)]" : "border-[var(--line)]"
                  }`}
                  onClick={() =>
                    updateActive((p) => ({
                      ...p,
                      appearance: {
                        ...p.appearance,
                        templateId: template.id as TemplateId,
                        accentColor: template.accent,
                        secondaryColor: template.secondary,
                      },
                    }))
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.preview}
                    alt={language === "fr" ? template.nameFr : template.name}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <strong>{language === "fr" ? template.nameFr : template.name}</strong>
                    <p className="m-0 text-xs text-[var(--ink-soft)]">
                      {language === "fr" ? template.descriptionFr : template.description}
                    </p>
                    {template.printFriendly ? <p className="m-0 text-xs">{t.wizard.printFriendly}</p> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {step === 1 ? (
          <ProfileForm
            profile={project.profile}
            t={t}
            notify={notify}
            onChange={(profile) =>
              updateActive((p) => ({
                ...p,
                profile,
                appearance: { ...p.appearance, accentColor: profile.brandColor, fontFamily: profile.fontFamily },
              }))
            }
          />
        ) : null}
        {step === 2 ? (
          <PlatformsForm
            platforms={project.platforms}
            t={t}
            language={language}
            notify={notify}
            onChange={(platforms) => updateActive((p) => ({ ...p, platforms }))}
          />
        ) : null}
        {step === 3 ? (
          <AudienceForm audience={project.audience} t={t} onChange={(audience) => updateActive((p) => ({ ...p, audience }))} />
        ) : null}
        {step === 4 ? <PricingPanel /> : null}
        {step === 5 ? (
          <OffersForm
            offers={project.offers}
            t={t}
            currency={project.offers[0]?.currency ?? "EUR"}
            onChange={(offers) => updateActive((p) => ({ ...p, offers }))}
          />
        ) : null}
        {step === 6 ? (
          <div className="overflow-auto">
            <MediaKitPreview project={project} language={language} />
          </div>
        ) : null}
        {step === 7 ? (
          <div className="grid gap-3">
            <p>{t.exportCenter.pdfText}</p>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await exportProjectPdf(project, language);
                  notify(t.toast.pdfReady);
                } catch (error) {
                  console.error(error);
                  notify(t.toast.pdfFailed);
                }
              }}
            >
              {t.exportCenter.generate}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.push(`/kits/${project.id}`)}>
              {t.wizard.finish}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          {t.wizard.back}
        </Button>
        {step < max ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(max, s + 1))}>
            {step < 6 ? t.wizard.next : t.wizard.skip}
          </Button>
        ) : (
          <Button type="button" onClick={() => router.push(`/kits/${project.id}`)}>
            {t.wizard.finish}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewKitPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <WizardInner />
    </Suspense>
  );
}
