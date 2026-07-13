import { describe, expect, it } from "vitest";
import { instructions } from "./office-back-instructions";

describe("office-back instructions", () => {
  it("has 7 exercises with unique slugs, positive durations, and text", () => {
    expect(instructions).toHaveLength(7);
    const slugs = instructions.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(7);
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
