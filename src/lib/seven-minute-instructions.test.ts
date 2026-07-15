import { describe, expect, it } from "vitest";
import { instructions } from "./seven-minute-instructions";

describe("seven-minute instructions", () => {
  it("has 13 exercises with unique slugs, positive durations, and text", () => {
    expect(instructions).toHaveLength(13);
    const slugs = instructions.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(13);
    for (const e of instructions) {
      expect(e.duration).toBeGreaterThan(0);
      expect(e.label.length).toBeGreaterThan(0);
      expect(e.text.length).toBeGreaterThan(0);
      expect(e.image?.accent.length).toBeGreaterThan(0);
      expect(e.image?.view.length).toBeGreaterThan(0);
      expect(e.image?.pose.length).toBeGreaterThan(0);
    }
  });

  // The spoken clip is "<label>. <text>" and must stay under ~8s so the preceding
  // rest never grows past its 10s floor (ceil(spoken) + 2). Measured clips run
  // ~15 chars/s, so 100 chars is the budget that keeps the rests at 10s.
  it("keeps every spoken line terse enough to fit a 10s rest", () => {
    for (const e of instructions) {
      expect(`${e.label}. ${e.text}`.length).toBeLessThanOrEqual(100);
    }
  });
});
