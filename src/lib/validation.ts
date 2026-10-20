import type { ExportPayload, MediaKitProject, ValidationIssue } from "@/types";
import { DATA_VERSION } from "@/types";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_JSON_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const HTTP_URL = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return HTTP_URL.test(value.trim());
  } catch {
    return false;
  }
}

export function optionalUrl(value: string): boolean {
  if (!value.trim()) return true;
  return isValidHttpUrl(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNonNegativeNumber(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  return isFiniteNumber(value) && value >= 0;
}

export function validateImageFile(file: File): ValidationIssue | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { field: "file", message: "unsupported_image" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { field: "file", message: "image_too_large" };
  }
  return null;
}

export function validateJsonFile(file: File): ValidationIssue | null {
  if (file.size > MAX_JSON_BYTES) {
    return { field: "file", message: "json_too_large" };
  }
  const name = file.name.toLowerCase();
  if (!name.endsWith(".json") && file.type && file.type !== "application/json" && file.type !== "text/json") {
    return { field: "file", message: "unsupported_json" };
  }
  return null;
}

export function validatePlatformUrl(url: string): ValidationIssue | null {
  if (!url.trim()) return null;
  if (!isValidHttpUrl(url)) {
    return { field: "url", message: "invalid_url" };
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateExportPayload(raw: unknown): { ok: true; payload: ExportPayload } | { ok: false; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!isRecord(raw)) {
    return { ok: false, issues: [{ field: "root", message: "invalid_structure" }] };
  }
  if (raw.format !== "sponsorsnap-project") {
    issues.push({ field: "format", message: "invalid_format" });
  }
  const version = raw.version;
  if (typeof version !== "number") {
    issues.push({ field: "version", message: "missing_version" });
  }
  if (!isRecord(raw.project)) {
    issues.push({ field: "project", message: "missing_project" });
    return { ok: false, issues };
  }
  const projectIssues = validateProjectShape(raw.project);
  issues.push(...projectIssues);
  if (issues.length) return { ok: false, issues };
  return { ok: true, payload: raw as unknown as ExportPayload };
}

export function validateProjectShape(raw: Record<string, unknown>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (typeof raw.id !== "string" || !raw.id) issues.push({ field: "id", message: "required" });
  if (typeof raw.name !== "string") issues.push({ field: "name", message: "required" });
  if (!isRecord(raw.profile)) issues.push({ field: "profile", message: "required" });
  if (!Array.isArray(raw.platforms)) issues.push({ field: "platforms", message: "required" });
  if (!isRecord(raw.audience)) issues.push({ field: "audience", message: "required" });
  if (!Array.isArray(raw.offers)) issues.push({ field: "offers", message: "required" });
  if (!isRecord(raw.appearance)) issues.push({ field: "appearance", message: "required" });
  const versionValue = raw.version;
  if (typeof versionValue !== "number" || !Number.isFinite(versionValue)) {
    issues.push({ field: "version", message: "required" });
  } else if (versionValue > DATA_VERSION) {
    issues.push({ field: "version", message: "unsupported_version" });
  }
  return issues;
}

export function assertSafeImportedProject(project: MediaKitProject): MediaKitProject {
  return {
    ...project,
    profile: {
      ...project.profile,
      publicName: String(project.profile.publicName ?? ""),
      brandName: String(project.profile.brandName ?? ""),
      shortBio: String(project.profile.shortBio ?? ""),
      longBio: String(project.profile.longBio ?? ""),
      photoDataUrl: sanitizeDataUrl(project.profile.photoDataUrl),
      logoDataUrl: sanitizeDataUrl(project.profile.logoDataUrl),
    },
  };
}

export function sanitizeDataUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  if (!value) return "";
  if (value.startsWith("data:image/") && value.includes(",")) return value;
  return "";
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
