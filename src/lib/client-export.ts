import { downloadBlob, downloadJson, serializeAll, serializeProject } from "@/lib/export";
import { backupFilename, projectFilename } from "@/lib/filename";
import { generateMediaKitPdf } from "@/lib/pdf";
import type { Language, MediaKitProject } from "@/types";

export async function exportProjectPdf(project: MediaKitProject, language: Language): Promise<void> {
  const { blob, filename } = await generateMediaKitPdf(project, language);
  downloadBlob(filename, blob);
}

export function exportProjectJson(project: MediaKitProject): void {
  downloadJson(projectFilename(project.name || project.profile.publicName || "project"), serializeProject(project));
}

export function exportAllJson(projects: MediaKitProject[]): void {
  downloadJson(backupFilename(), serializeAll(projects));
}
