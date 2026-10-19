import { describe, expect, it } from "vitest";
import { instructions } from "./basketball-stretch-instructions";

describe("basketball-stretch instructions", () => {
  it("has 12 exercises with unique slugs, positive durations, text, and a complete image", () => {
    expect(instructions).toHaveLength(12);
    const slugs = instructions.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(12);
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
