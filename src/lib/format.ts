import type { Language } from "@/types";

export function formatNumber(value: number | null | undefined, language: Language, options?: Intl.NumberFormatOptions): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const locale = language === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCompact(value: number | null | undefined, language: Language): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const locale = language === "fr" ? "fr-FR" : "en-US";
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(
  value: number | null | undefined,
  currency: string,
  language: Language,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const locale = language === "fr" ? "fr-FR" : "en-US";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${formatNumber(value, language)} ${currency}`;
  }
}

export function formatPercent(value: number | null | undefined, language: Language): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${formatNumber(value, language, { maximumFractionDigits: 2 })}%`;
}

export function formatDate(iso: string | undefined, language: Language): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function formatDateTime(iso: string | undefined, language: Language): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
