import { describe, expect, it } from "vitest";
import {
  isValidHttpUrl,
  optionalUrl,
  sanitizeDataUrl,
  validateExportPayload,
  validateJsonFile,
  validateProjectShape,
} from "@/lib/validation";
import { createProject } from "@/lib/project";
import { parseImportedJson, serializeProject } from "@/lib/export";
import { migrateProject } from "@/lib/migrate";

describe("URL validation", () => {
  it("accepts http(s) and rejects others", () => {
    expect(isValidHttpUrl("https://example.com/x")).toBe(true);
    expect(isValidHttpUrl("http://localhost:3000")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("ftp://files")).toBe(false);
    expect(isValidHttpUrl("")).toBe(false);
    expect(optionalUrl("")).toBe(true);
  });
});

describe("files", () => {
  it("rejects oversized JSON", () => {
    const file = new File(["x"], "kit.json", { type: "application/json" });
    Object.defineProperty(file, "size", { value: 9 * 1024 * 1024 });
    expect(validateJsonFile(file)?.message).toBe("json_too_large");
  });
});

describe("import / export", () => {
  it("round-trips a project", () => {
    const project = createProject("Café créateur");
    project.profile.publicName = "Léa";
    const json = JSON.stringify(serializeProject(project));
    const parsed = parseImportedJson(json);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.projects[0]?.profile.publicName).toBe("Léa");
      expect(parsed.projects[0]?.name).toBe("Café créateur");
    }
  });

  it("rejects invalid JSON and unknown formats", () => {
    expect(parseImportedJson("{").ok).toBe(false);
    expect(parseImportedJson("[]").ok).toBe(false);
    expect(parseImportedJson(JSON.stringify({ format: "nope" })).ok).toBe(false);
  });

  it("strips non-image data URLs", () => {
    expect(sanitizeDataUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeDataUrl("data:image/png;base64,abc")).toContain("data:image/png");
  });

  it("validates required project fields", () => {
    const issues = validateProjectShape({} as Record<string, unknown>);
    expect(issues.some((i) => i.field === "id")).toBe(true);
    const payload = validateExportPayload({ format: "sponsorsnap-project", version: 1, project: { id: "x" } });
    expect(payload.ok).toBe(false);
  });

  it("migrates a sparse legacy object", () => {
    const migrated = migrateProject({ id: "old", name: "Legacy", version: 0 });
    expect(migrated.version).toBe(1);
    expect(migrated.profile.publicName).toBe("");
    expect(migrated.sections.length).toBeGreaterThan(0);
  });
});
