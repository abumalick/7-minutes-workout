import { describe, expect, it } from "vitest";
import { instructions } from "./sciatica-instructions";

describe("sciatica instructions", () => {
  it("has 16 exercises with unique slugs, positive durations, text, and a complete image", () => {
    expect(instructions).toHaveLength(16);
    const slugs = instructions.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(16);
    for (const e of instructions) {
      expect(e.duration).toBeGreaterThan(0);
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.image?.accent.length).toBeGreaterThan(0);
      expect(e.image?.view.length).toBeGreaterThan(0);
      expect(e.image?.pose.length).toBeGreaterThan(0);
    }
  });
});
