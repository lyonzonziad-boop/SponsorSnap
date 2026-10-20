import { describe, expect, it } from "vitest";
import { mediaKitFilename, projectFilename, slugifyFilenamePart } from "@/lib/filename";

describe("filename sanitization", () => {
  it("removes illegal characters and accents", () => {
    expect(slugifyFilenamePart('Léa "Studio"/A?')).toBe("lea-studio-a");
  });

  it("falls back when empty", () => {
    expect(slugifyFilenamePart("   ")).toBe("media-kit");
    expect(mediaKitFilename("")).toBe("sponsorsnap-media-kit-creator.pdf");
    expect(projectFilename("My Kit")).toBe("sponsorsnap-my-kit.json");
  });
});
