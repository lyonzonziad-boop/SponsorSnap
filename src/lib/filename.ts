const INVALID = /[<>:"/\\|?*\u0000-\u001f]/g;

export function slugifyFilenamePart(value: string, fallback = "media-kit"): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(INVALID, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const cleaned = normalized.slice(0, 60);
  return cleaned || fallback;
}

export function mediaKitFilename(publicName: string): string {
  const slug = slugifyFilenamePart(publicName, "creator");
  return `sponsorsnap-media-kit-${slug}.pdf`;
}

export function projectFilename(projectName: string): string {
  const slug = slugifyFilenamePart(projectName, "project");
  return `sponsorsnap-${slug}.json`;
}

export function backupFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `sponsorsnap-backup-${stamp}.json`;
}
