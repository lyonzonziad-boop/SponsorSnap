"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExamplesForm, OffersForm, ProfileForm } from "@/components/forms";
import { MediaKitPreview } from "@/components/kit-preview";
import { PageHeader } from "@/components/shell";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportProjectPdf } from "@/lib/client-export";
import { FONT_OPTIONS } from "@/types";
import { projectCompleteness } from "@/lib/sections";
import { SECTION_LABELS, TEMPLATES } from "@/lib/templates";
import type { TemplateId } from "@/types";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const { t, language, projects, active, setActiveId, updateActive, saveNow, saveStatus, notify } = useApp();
  const [tab, setTab] = useState<"configure" | "preview">("configure");

  useEffect(() => {
    if (params.id) setActiveId(params.id);
  }, [params.id, setActiveId]);

  const project = active && active.id === params.id ? active : projects.find((p) => p.id === params.id) ?? null;

  if (!project) {
    return <p>{t.common.needProject}</p>;
  }

  const completeness = projectCompleteness(project);

  return (
    <div>
      <PageHeader
        title={project.name || t.editor.title}
        subtitle={completeness.filled < completeness.total ? t.editor.missingInfo : t.brand.tagline}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void saveNow()}>
              {saveStatus === "saving" ? t.editor.saving : t.editor.save}
            </Button>
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
              {t.editor.exportPdf}
            </Button>
          </div>
        }
      />
      <div className="mb-4 flex gap-2 lg:hidden">
        <Button type="button" variant={tab === "configure" ? "primary" : "secondary"} onClick={() => setTab("configure")}>
          {t.editor.configure}
        </Button>
        <Button type="button" variant={tab === "preview" ? "primary" : "secondary"} onClick={() => setTab("preview")}>
          {t.editor.preview}
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className={`grid gap-4 ${tab === "preview" ? "hidden xl:grid" : ""}`}>
          <div className="ss-card p-4">
            <Label label={t.wizard.projectName}>
              <Input value={project.name} onChange={(e) => updateActive((p) => ({ ...p, name: e.target.value }))} />
            </Label>
            <Label label={t.editor.template}>
              <Select
                value={project.appearance.templateId}
                onChange={(e) =>
                  updateActive((p) => ({
                    ...p,
                    appearance: { ...p.appearance, templateId: e.target.value as TemplateId },
                  }))
                }
              >
                {TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {language === "fr" ? template.nameFr : template.name}
                  </option>
                ))}
              </Select>
            </Label>
            <Label label={t.editor.colors}>
              <Input
                type="color"
                value={project.appearance.accentColor}
                onChange={(e) =>
                  updateActive((p) => ({ ...p, appearance: { ...p.appearance, accentColor: e.target.value } }))
                }
              />
            </Label>
            <Label label={t.editor.typeface}>
              <Select
                value={project.appearance.fontFamily}
                onChange={(e) =>
                  updateActive((p) => ({ ...p, appearance: { ...p.appearance, fontFamily: e.target.value } }))
                }
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </Label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={project.appearance.showEmptySections}
                onChange={(e) =>
                  updateActive((p) => ({
                    ...p,
                    appearance: { ...p.appearance, showEmptySections: e.target.checked },
                  }))
                }
              />
              {t.editor.showEmpty}
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={project.statsSelfDeclared}
                onChange={(e) => updateActive((p) => ({ ...p, statsSelfDeclared: e.target.checked }))}
              />
              {t.editor.selfDeclared}
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={project.ratesIndicative}
                onChange={(e) => updateActive((p) => ({ ...p, ratesIndicative: e.target.checked }))}
              />
              {t.editor.ratesIndicative}
            </label>
          </div>
          <div className="ss-card p-4">
            <h2 className="mt-0 text-base font-semibold">{t.editor.sections}</h2>
            <div className="grid gap-2">
              {project.sections.map((section, index) => (
                <div className="flex items-center justify-between gap-2" key={section.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        updateActive((p) => ({
                          ...p,
                          sections: p.sections.map((s) => (s.id === section.id ? { ...s, enabled: e.target.checked } : s)),
                        }))
                      }
                    />
                    {SECTION_LABELS[section.id][language]}
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[var(--ink-soft)]"
                    disabled={index === 0}
                    onClick={() =>
                      updateActive((p) => {
                        const next = [...p.sections];
                        const current = next[index];
                        const prev = next[index - 1];
                        if (!current || !prev) return p;
                        next[index - 1] = current;
                        next[index] = prev;
                        return { ...p, sections: next };
                      })
                    }
                  >
                    ↑
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="ss-card p-4">
            <h2 className="mt-0 text-base font-semibold">{t.profile.title}</h2>
            <ProfileForm
              profile={project.profile}
              t={t}
              notify={notify}
              onChange={(profile) => updateActive((p) => ({ ...p, profile }))}
            />
          </div>
          <div className="ss-card p-4">
            <OffersForm
              offers={project.offers}
              t={t}
              currency={project.offers[0]?.currency ?? "EUR"}
              onChange={(offers) => updateActive((p) => ({ ...p, offers }))}
            />
          </div>
          <div className="ss-card p-4">
            <ExamplesForm project={project} t={t} onChange={(next) => updateActive(() => next)} />
            <Label label={language === "fr" ? "Notes et conditions (facultatif)" : "Notes & terms (optional)"}>
              <Textarea value={project.terms} onChange={(e) => updateActive((p) => ({ ...p, terms: e.target.value }))} />
            </Label>
          </div>
        </div>
        <div className={tab === "configure" ? "hidden xl:block" : ""}>
          <MediaKitPreview project={project} language={language} />
        </div>
      </div>
    </div>
  );
}
