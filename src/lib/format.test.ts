import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

describe("format", () => {
  it("uses a dash for missing numbers", () => {
    expect(formatNumber(null, "en")).toBe("—");
    expect(formatNumber(Number.NaN, "fr")).toBe("—");
    expect(formatPercent(null, "en")).toBe("—");
  });

  it("formats currency without crashing on unknown codes", () => {
    expect(formatCurrency(1200, "EUR", "fr")).toMatch(/1/);
    expect(formatCurrency(10, "NOTACURRENCY", "en")).toContain("NOTACURRENCY");
  });
});
