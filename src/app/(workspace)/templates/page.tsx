"use client";

import { PageHeader } from "@/components/shell";
import { Button } from "@/components/ui";
import { NeedProject } from "@/components/forms";
import { useApp } from "@/context/app-context";
import { TEMPLATES } from "@/lib/templates";
import type { TemplateId } from "@/types";

export default function TemplatesPage() {
  const { t, language, active, updateActive } = useApp();
  if (!active) {
    return (
      <div>
        <PageHeader title={t.nav.templates} />
        <NeedProject t={t} />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title={t.nav.templates} subtitle={t.landing.templatesText} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => (
          <article className="ss-card overflow-hidden" key={template.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={template.preview}
              alt={language === "fr" ? template.nameFr : template.name}
              className="h-40 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="mt-0 text-lg font-semibold">{language === "fr" ? template.nameFr : template.name}</h2>
              <p className="text-sm text-[var(--ink-soft)]">
                {language === "fr" ? template.descriptionFr : template.description}
              </p>
              {template.printFriendly ? <p className="text-xs">{t.wizard.printFriendly}</p> : null}
              <Button
                type="button"
                variant={active.appearance.templateId === template.id ? "primary" : "secondary"}
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
                {t.common.apply}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
