"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shell";
import { Button, EmptyState, Modal } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportProjectJson, exportProjectPdf } from "@/lib/client-export";
import { formatDate, formatDateTime } from "@/lib/format";
import { getTemplate } from "@/lib/templates";

export default function KitsPage() {
  const { t, projects, language, duplicate, remove, setActiveId, notify } = useApp();
  const [pendingId, setPendingId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title={t.kits.title}
        actions={
          <Link href="/kits/new" className="ss-btn ss-btn-primary">
            {t.dashboard.create}
          </Link>
        }
      />
      {projects.length === 0 ? (
        <EmptyState
          title={t.dashboard.emptyTitle}
          text={t.kits.empty}
          imageSrc="/images/creator-studio.jpg"
          imageAlt={t.landing.galleryAlts[3]}
          action={
            <Link href="/kits/new" className="ss-btn ss-btn-primary">
              {t.dashboard.emptyCta}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const template = getTemplate(project.appearance.templateId);
            return (
              <article className="ss-card overflow-hidden" key={project.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.preview}
                  alt={language === "fr" ? template.nameFr : template.name}
                  className="h-36 w-full object-cover"
                />
                <div className="p-4">
                  <h2 className="mt-0 text-lg font-semibold">{project.name}</h2>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {t.kits.created} {formatDate(project.createdAt, language)} · {t.kits.modified}{" "}
                    {formatDateTime(project.updatedAt, language)}
                  </p>
                  <p className="text-sm">
                    {t.kits.template}: {language === "fr" ? template.nameFr : template.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/kits/${project.id}`}
                      className="ss-btn ss-btn-primary"
                      onClick={() => setActiveId(project.id)}
                    >
                      {t.kits.edit}
                    </Link>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        const copy = await duplicate(project.id);
                        if (copy) notify(t.toast.duplicated);
                      }}
                    >
                      {t.kits.duplicate}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
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
                      {t.kits.exportPdf}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => exportProjectJson(project)}>
                      {t.kits.exportJson}
                    </Button>
                    <Button type="button" variant="danger" onClick={() => setPendingId(project.id)}>
                      {t.kits.delete}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <Modal open={Boolean(pendingId)} title={t.kits.delete} onClose={() => setPendingId(null)}>
        <p>{t.kits.confirmDelete}</p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              if (pendingId) {
                await remove(pendingId);
                notify(t.toast.deleted);
              }
              setPendingId(null);
            }}
          >
            {t.common.confirm}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPendingId(null)}>
            {t.kits.cancel}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
