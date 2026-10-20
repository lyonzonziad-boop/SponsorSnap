import { migrateProject } from "@/lib/migrate";
import { assertSafeImportedProject, validateExportPayload } from "@/lib/validation";
import { DATA_VERSION, type ExportPayload, type MediaKitProject, type ValidationIssue } from "@/types";

export function serializeProject(project: MediaKitProject): ExportPayload {
  return {
    format: "sponsorsnap-project",
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    project,
  };
}

export function serializeAll(projects: MediaKitProject[]): {
  format: "sponsorsnap-backup";
  version: number;
  exportedAt: string;
  projects: MediaKitProject[];
} {
  return {
    format: "sponsorsnap-backup",
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    projects,
  };
}

export function parseImportedJson(text: string): { ok: true; projects: MediaKitProject[] } | { ok: false; issues: ValidationIssue[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, issues: [{ field: "json", message: "invalid_json" }] };
  }

  if (typeof raw !== "object" || raw === null) {
    return { ok: false, issues: [{ field: "root", message: "invalid_structure" }] };
  }

  const record = raw as Record<string, unknown>;

  if (record.format === "sponsorsnap-backup") {
    if (!Array.isArray(record.projects)) {
      return { ok: false, issues: [{ field: "projects", message: "missing_project" }] };
    }
    const projects: MediaKitProject[] = [];
    for (const item of record.projects) {
      if (typeof item !== "object" || item === null) {
        return { ok: false, issues: [{ field: "projects", message: "invalid_structure" }] };
      }
      projects.push(assertSafeImportedProject(migrateProject(item as Record<string, unknown>)));
    }
    return { ok: true, projects };
  }

  if (record.format === "sponsorsnap-project" || record.project) {
    const checked = validateExportPayload(record);
    if (!checked.ok) return checked;
    return {
      ok: true,
      projects: [assertSafeImportedProject(migrateProject(checked.payload.project as unknown as Record<string, unknown>))],
    };
  }

  if ("id" in record && "profile" in record) {
    return { ok: true, projects: [assertSafeImportedProject(migrateProject(record))] };
  }

  return { ok: false, issues: [{ field: "format", message: "invalid_format" }] };
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(filename, blob);
}
