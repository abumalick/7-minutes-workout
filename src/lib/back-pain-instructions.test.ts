import { describe, expect, it } from "vitest";
import { instructions } from "./back-pain-instructions";

describe("back-pain instructions", () => {
  it("has 19 exercises with unique slugs, positive durations, text, and a complete image", () => {
    expect(instructions).toHaveLength(19);
    const slugs = instructions.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(19);
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
