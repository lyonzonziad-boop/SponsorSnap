"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { useApp } from "@/context/app-context";
import { TEMPLATES } from "@/lib/templates";

const GALLERY = [
  {
    src: "/images/creator-vlog.jpg",
    className: "col-span-2 row-span-2 min-h-[220px] md:min-h-[280px]",
    altKey: 0,
  },
  {
    src: "/images/portrait-studio.jpg",
    className: "min-h-[140px] md:min-h-[134px]",
    altKey: 1,
  },
  {
    src: "/images/creator-fashion.jpg",
    className: "min-h-[140px] md:min-h-[134px]",
    altKey: 2,
  },
  {
    src: "/images/creator-studio.jpg",
    className: "col-span-2 min-h-[140px]",
    altKey: 3,
  },
  {
    src: "/images/creator-cooking.jpg",
    className: "min-h-[140px]",
    altKey: 4,
  },
  {
    src: "/images/ring-light.jpg",
    className: "min-h-[140px]",
    altKey: 5,
  },
  {
    src: "/images/creator-smile.jpg",
    className: "min-h-[140px]",
    altKey: 6,
  },
  {
    src: "/images/typing-desk.jpg",
    className: "min-h-[140px]",
    altKey: 7,
  },
] as const;

const HOW_IMAGES = [
  "/images/template-minimal.jpg",
  "/images/creator-studio.jpg",
  "/images/workspace.jpg",
] as const;

export default function LandingPage() {
  const { t, language, createKit, setSettings } = useApp();
  const router = useRouter();

  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt={t.landing.logoAlt} className="h-9 w-9 rounded-xl object-cover" />
          SponsorSnap
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--ink-soft)] md:flex" aria-label="Primary">
          <a href="#features">{t.nav.features}</a>
          <a href="#how">{t.nav.how}</a>
          <a href="#templates">{t.nav.templates}</a>
          <a href="#faq">{t.nav.faq}</a>
          <Link href="/privacy">{t.nav.privacy}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ss-btn ss-btn-ghost text-sm"
            onClick={() => setSettings({ language: language === "en" ? "fr" : "en" })}
          >
            {language === "en" ? "FR" : "EN"}
          </button>
          <Link href="/dashboard" className="ss-btn ss-btn-secondary hidden sm:inline-flex">
            {t.nav.openApp}
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="m-0 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{t.brand.tagline}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{t.landing.heroTitle}</h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--ink-soft)]">{t.landing.heroText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={async () => {
                  const project = await createKit();
                  router.push(`/kits/new?id=${project.id}`);
                }}
              >
                {t.landing.ctaPrimary} <ArrowRight size={16} />
              </button>
              <a href="#templates" className="ss-btn ss-btn-secondary">
                {t.landing.ctaSecondary}
              </a>
            </div>
          </div>
          <figure className="ss-card overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kit-preview.jpg" alt={t.landing.kitPreviewAlt} className="h-auto w-full object-cover" />
            <figcaption className="px-4 py-3 text-sm text-[var(--ink-soft)]">{t.landing.previewCaption}</figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16" aria-labelledby="gallery-title">
          <h2 id="gallery-title" className="mt-0 text-3xl font-semibold tracking-tight">
            {t.landing.galleryTitle}
          </h2>
          <p className="max-w-2xl text-[var(--ink-soft)]">{t.landing.galleryText}</p>
          <div className="ss-mosaic mt-8">
            {GALLERY.map((item) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.src}
                src={item.src}
                alt={t.landing.galleryAlts[item.altKey]}
                className={item.className}
              />
            ))}
          </div>
        </section>

        <section id="features" className="bg-[var(--bg-elev)] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mt-0 text-3xl font-semibold tracking-tight">{t.landing.benefitsTitle}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {t.landing.benefits.map((item) => (
                <article className="ss-card p-5" key={item.title}>
                  <h3 className="mt-0 text-lg font-semibold">{item.title}</h3>
                  <p className="mb-0 text-[var(--ink-soft)]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mt-0 text-3xl font-semibold tracking-tight">{t.landing.howTitle}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {t.landing.how.map((item, index) => (
              <li className="ss-card overflow-hidden" key={item.step}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HOW_IMAGES[index]}
                  alt={t.landing.howImageAlts[index]}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <div className="text-sm font-semibold text-[var(--accent)]">{item.step}</div>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mb-0 text-[var(--ink-soft)]">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="templates" className="bg-[var(--bg-elev)] py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mt-0 text-3xl font-semibold tracking-tight">{t.landing.templatesTitle}</h2>
            <p className="max-w-2xl text-[var(--ink-soft)]">{t.landing.templatesText}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((template) => {
                const name = language === "fr" ? template.nameFr : template.name;
                return (
                  <article className="ss-card overflow-hidden" key={template.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={template.preview}
                      alt={`${name} — ${t.landing.templatePreviewAlt}`}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="mt-0 text-lg font-semibold">{name}</h3>
                      <p className="mb-0 text-sm text-[var(--ink-soft)]">
                        {language === "fr" ? template.descriptionFr : template.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
          <div className="ss-card p-6">
            <Lock className="text-[var(--accent)]" />
            <h2 className="text-2xl font-semibold">{t.landing.privacyTitle}</h2>
            <p className="text-[var(--ink-soft)]">{t.landing.privacyText}</p>
            <Link href="/privacy" className="ss-btn ss-btn-secondary">
              {t.landing.privacyCta}
            </Link>
          </div>
          <div className="overflow-hidden rounded-[1.15rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/workspace.jpg" alt={t.landing.privacyImageAlt} className="h-full min-h-[280px] w-full object-cover" />
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-3xl font-semibold tracking-tight">{t.landing.faqTitle}</h2>
          <div className="mt-6 grid gap-3">
            {t.landing.faq.map((item) => (
              <details className="ss-card p-4" key={item.q}>
                <summary className="cursor-pointer font-semibold">{item.q}</summary>
                <p className="mb-0 mt-2 text-[var(--ink-soft)]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
          <span>SponsorSnap</span>
          <div className="flex gap-4">
            <Link href="/privacy">{t.landing.footerPrivacy}</Link>
            <Link href="/settings">{t.landing.footerSettings}</Link>
            <Link href="/dashboard">{t.nav.openApp}</Link>
          </div>
          <span>{t.landing.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}
