"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell";
import { EmptyState } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { formatDateTime } from "@/lib/format";
import { TEMPLATES } from "@/lib/templates";

export default function DashboardPage() {
  const { t, projects, language, storageAvailable } = useApp();
  const latest = projects[0];

  return (
    <div>
      <PageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={
          <Link href="/kits/new" className="ss-btn ss-btn-primary">
            {t.dashboard.create}
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <article className="ss-card p-5">
          <p className="m-0 text-sm text-[var(--ink-soft)]">{t.dashboard.kitsSaved}</p>
          <p className="mt-2 text-3xl font-semibold">{projects.length}</p>
        </article>
        <article className="ss-card p-5">
          <p className="m-0 text-sm text-[var(--ink-soft)]">{t.dashboard.lastEdited}</p>
          <p className="mt-2 text-lg font-semibold">{latest ? latest.name : t.dashboard.noneYet}</p>
          <p className="text-sm text-[var(--ink-soft)]">{latest ? formatDateTime(latest.updatedAt, language) : ""}</p>
        </article>
        <article className="ss-card p-5">
          <p className="m-0 text-sm text-[var(--ink-soft)]">{storageAvailable ? t.dashboard.storageOk : t.dashboard.storageWarn}</p>
        </article>
      </div>

      {projects.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t.dashboard.emptyTitle}
            text={t.dashboard.emptyText}
            imageSrc="/images/kit-preview.jpg"
            imageAlt={t.landing.kitPreviewAlt}
            action={
              <Link href="/kits/new" className="ss-btn ss-btn-primary">
                {t.dashboard.emptyCta}
              </Link>
            }
          />
        </div>
      ) : (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">{t.dashboard.recent}</h2>
          <div className="mt-3 grid gap-3">
            {projects.slice(0, 5).map((project) => (
              <Link href={`/kits/${project.id}`} key={project.id} className="ss-card flex items-center justify-between p-4">
                <div>
                  <strong>{project.name}</strong>
                  <p className="m-0 text-sm text-[var(--ink-soft)]">{formatDateTime(project.updatedAt, language)}</p>
                </div>
                <span className="text-sm capitalize">{project.appearance.templateId}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">{t.dashboard.templates}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {TEMPLATES.map((template) => (
              <Link href="/templates" key={template.id} className="ss-card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.preview}
                  alt={language === "fr" ? template.nameFr : template.name}
                  className="h-24 w-full object-cover"
                />
                <p className="p-2 text-sm font-medium">{language === "fr" ? template.nameFr : template.name}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="ss-card p-5">
          <h2 className="mt-0 text-xl font-semibold">{t.dashboard.tipsTitle}</h2>
          <ul className="m-0 grid gap-2 pl-4 text-[var(--ink-soft)]">
            {t.dashboard.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
