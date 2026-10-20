import en from "@/i18n/en";
import fr from "@/i18n/fr";
import type { Language } from "@/types";

export const dictionaries = { en, fr };

export type Dictionary = typeof en;

export function getDictionary(language: Language): Dictionary {
  return language === "fr" ? (fr as unknown as Dictionary) : en;
}
