"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Calculator,
  Download,
  FolderKanban,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Settings,
  Sparkles,
  UserRound,
  X,
  BarChart3,
} from "lucide-react";
import { useApp } from "@/context/app-context";

const LINKS = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/kits", key: "kits", icon: FolderKanban },
  { href: "/profile", key: "profile", icon: UserRound },
  { href: "/platforms", key: "platforms", icon: BarChart3 },
  { href: "/pricing", key: "pricing", icon: Calculator },
  { href: "/templates", key: "templates", icon: LayoutTemplate },
  { href: "/export", key: "export", icon: Download },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, saveStatus } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="grid gap-1" aria-label={t.nav.openApp}>
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
              active ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink-soft)] hover:bg-[var(--bg-soft)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {t.nav[link.key]}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-[var(--bg-elev)] p-5 lg:flex lg:flex-col">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="SponsorSnap" className="h-8 w-8 rounded-lg object-cover" />
          SponsorSnap
        </Link>
        {nav}
        <p className="mt-auto pt-6 text-xs text-[var(--ink-soft)]">
          {saveStatus === "saving" ? t.editor.saving : saveStatus === "saved" ? t.editor.saved : saveStatus === "error" ? t.editor.saveError : t.brand.tagline}
        </p>
      </aside>
      <div>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-4 py-3 backdrop-blur lg:px-8">
          <button type="button" className="ss-btn ss-btn-ghost lg:hidden" aria-label={t.common.menu} onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <Sparkles size={18} />
            SponsorSnap
          </Link>
          <div className="hidden text-sm text-[var(--ink-soft)] lg:block">{t.brand.tagline}</div>
          <Link href="/kits/new" className="ss-btn ss-btn-primary">
            {t.dashboard.create}
          </Link>
        </header>
        <main id="main" className="px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label={t.common.close} onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-xs bg-[var(--bg-elev)] p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <strong>SponsorSnap</strong>
              <button type="button" className="ss-btn ss-btn-ghost" onClick={() => setOpen(false)} aria-label={t.common.close}>
                <X size={18} />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="m-0 text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-[var(--ink-soft)]">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}
