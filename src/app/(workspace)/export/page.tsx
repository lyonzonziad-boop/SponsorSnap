"use client";

import { useState } from "react";
import { NeedProject } from "@/components/forms";
import { PageHeader } from "@/components/shell";
import { Button } from "@/components/ui";
import { useApp } from "@/context/app-context";
import { exportAllJson, exportProjectJson, exportProjectPdf } from "@/lib/client-export";
import { serializeProject } from "@/lib/export";
import { MAX_JSON_BYTES, validateJsonFile } from "@/lib/validation";

export default function ExportPage() {
  const { t, active, projects, language, importJsonText, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onImport(file: File | undefined) {
    if (!file) return;
    const issue = validateJsonFile(file);
    if (issue?.message === "json_too_large") {
      notify(t.toast.jsonLarge);
      return;
    }
    const text = await file.text();
    try {
      const first = await importJsonText(text, false);
      if (first.needsConfirm?.length) {
        const ok = window.confirm(t.exportCenter.replaceConfirm);
        if (!ok) return;
        await importJsonText(text, true);
      }
      notify(t.toast.imported);
    } catch (error) {
      console.error(error);
      notify(t.toast.importFailed);
    }
  }

  return (
    <div>
      <PageHeader title={t.exportCenter.title} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.exportCenter.pdfTitle}</h2>
          <p className="text-[var(--ink-soft)]">{t.exportCenter.pdfText}</p>
          {active ? (
            <>
              <Button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setFailed(false);
                  try {
                    await exportProjectPdf(active, language);
                    notify(t.toast.pdfReady);
                  } catch (error) {
                    console.error(error);
                    setFailed(true);
                    notify(t.toast.pdfFailed);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? t.exportCenter.generating : t.exportCenter.generate}
              </Button>
              {failed ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="ml-2"
                  onClick={async () => {
                    try {
                      await exportProjectPdf(active, language);
                      setFailed(false);
                      notify(t.toast.pdfReady);
                    } catch (error) {
                      console.error(error);
                      notify(t.toast.pdfFailed);
                    }
                  }}
                >
                  {t.exportCenter.retry}
                </Button>
              ) : null}
            </>
          ) : (
            <NeedProject t={t} />
          )}
        </section>
        <section className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.exportCenter.jsonTitle}</h2>
          <p className="text-[var(--ink-soft)]">{t.exportCenter.jsonText}</p>
          <Button type="button" variant="secondary" disabled={!active} onClick={() => active && exportProjectJson(active)}>
            {t.exportCenter.downloadJson}
          </Button>
          <Button type="button" variant="ghost" className="ml-2" onClick={() => exportAllJson(projects)}>
            {t.settings.exportAll}
          </Button>
        </section>
        <section className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.exportCenter.importTitle}</h2>
          <p className="text-[var(--ink-soft)]">{t.exportCenter.importText}</p>
          <label className="ss-btn ss-btn-secondary cursor-pointer">
            {t.exportCenter.import}
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => void onImport(e.target.files?.[0])}
            />
          </label>
        </section>
        <section className="ss-card p-5">
          <h2 className="mt-0 text-lg font-semibold">{t.exportCenter.shareTitle}</h2>
          <p className="text-[var(--ink-soft)]">{t.exportCenter.shareText}</p>
          <Button
            type="button"
            variant="secondary"
            disabled={!active}
            onClick={async () => {
              if (!active) return;
              const payload = JSON.stringify(serializeProject(active));
              if (payload.length > Math.min(80_000, MAX_JSON_BYTES)) {
                notify(t.exportCenter.tooLarge);
                return;
              }
              const link = `data:application/json;charset=utf-8,${encodeURIComponent(payload)}`;
              await navigator.clipboard.writeText(link);
              notify(t.exportCenter.copied);
            }}
          >
            {t.exportCenter.copyLink}
          </Button>
        </section>
      </div>
    </div>
  );
}
