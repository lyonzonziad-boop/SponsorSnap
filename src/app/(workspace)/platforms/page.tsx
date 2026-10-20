"use client";

import { AudienceForm, NeedProject, PlatformsForm } from "@/components/forms";
import { PageHeader } from "@/components/shell";
import { useApp } from "@/context/app-context";
import { aggregateAudience } from "@/lib/stats";
import { formatCompact } from "@/lib/format";

export default function PlatformsPage() {
  const { t, active, updateActive, notify, language } = useApp();
  if (!active) return <NeedProject t={t} />;
  const totals = aggregateAudience(active.platforms);
  return (
    <div>
      <PageHeader title={t.platforms.title} />
      {totals.followerSum !== null ? (
        <p className="text-sm text-[var(--ink-soft)]">
          {t.platforms.followers}: {formatCompact(totals.followerSum, language)} · {t.platforms.totalsNote}
        </p>
      ) : null}
      {totals.mixedMethods ? <p className="text-sm">{t.platforms.mixedMethods}</p> : null}
      <div className="mt-4 grid gap-6">
        <PlatformsForm
          platforms={active.platforms}
          t={t}
          language={language}
          notify={notify}
          onChange={(platforms) => updateActive((p) => ({ ...p, platforms }))}
        />
        <div className="ss-card p-5">
          <AudienceForm audience={active.audience} t={t} onChange={(audience) => updateActive((p) => ({ ...p, audience }))} />
        </div>
      </div>
    </div>
  );
}
