"use client";

import Link from "next/link";
import { useApp } from "@/context/app-context";

export default function PrivacyPage() {
  const { t } = useApp();
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-[var(--accent)]">
        SponsorSnap
      </Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">{t.privacyPage.title}</h1>
      <p className="text-lg text-[var(--ink-soft)]">{t.privacyPage.intro}</p>
      <div className="overflow-hidden rounded-[1.15rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/workspace.jpg"
          alt={t.landing.privacyImageAlt}
          className="h-64 w-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-semibold">{t.privacyPage.localTitle}</h2>
      <ul>
        {t.privacyPage.local.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold">{t.privacyPage.notTitle}</h2>
      <ul>
        {t.privacyPage.not.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold">{t.privacyPage.deleteTitle}</h2>
      <p>{t.privacyPage.deleteText}</p>
      <Link href="/settings" className="ss-btn ss-btn-primary">
        {t.nav.settings}
      </Link>
    </main>
  );
}
