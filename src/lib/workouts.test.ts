import { describe, expect, it } from "vitest";
import { isRest } from "./workout";
import { backPainWorkout, buildWorkout, WORKOUTS } from "./workouts";

describe("backPainWorkout", () => {
  const steps = backPainWorkout.steps;

  it("gives every exercise a voice and every rest the following exercise's voice", () => {
    steps.forEach((step, i) => {
      expect(typeof step.voice).toBe("string");
      if (isRest(step)) expect(step.voice).toBe(steps[i + 1].voice);
    });
  });

  it("gives every exercise an image and no rest an image", () => {
    for (const step of steps) {
      if (isRest(step)) expect(step.image).toBeUndefined();
      else expect(typeof step.image).toBe("string");
    }
  });

  it("opens on a Rest, ends on an exercise, with a 10s Rest before every exercise", () => {
    expect(isRest(steps[0])).toBe(true);
    expect(isRest(steps[steps.length - 1])).toBe(false);
    steps.forEach((step, i) => {
      if (isRest(step)) {
        expect(step.duration).toBe(10);
        expect(isRest(steps[i + 1])).toBe(false);
      } else if (i > 0) {
        expect(isRest(steps[i - 1])).toBe(true);
      }
    });
  });

  it("has 19 exercises", () => {
    expect(steps.filter((s) => !isRest(s))).toHaveLength(19);
  });
});

describe("buildWorkout", () => {
  it("interleaves a 10s Rest before every exercise, including the first", () => {
    const w = buildWorkout("back-pain", "X", [
      { slug: "06-piriforme-gauche", label: "A", duration: 30, text: "" },
      { slug: "07-piriforme-droit", label: "B", duration: 30, text: "" },
    ]);
    expect(w.steps.map((s) => s.label)).toEqual(["Rest", "A", "Rest", "B"]);
    expect(w.steps[0].duration).toBe(10);
    expect(typeof w.steps[1].voice).toBe("string");
    expect(typeof w.steps[1].image).toBe("string");
    // Each Rest previews the following exercise: it carries that exercise's voice.
    expect(w.steps[0].voice).toBe(w.steps[1].voice);
    expect(w.steps[2].voice).toBe(w.steps[3].voice);
  });

  it("throws on a slug with no matching asset", () => {
    expect(() =>
      buildWorkout("back-pain", "X", [{ slug: "nope", label: "A", duration: 30, text: "" }]),
    ).toThrow();
  });
});

describe("cues", () => {
  it("every workout carries a French cue set that resolves", () => {
    for (const w of WORKOUTS) {
      expect(typeof w.cues?.go).toBe("string");
      for (const n of [1, 2, 3, 4, 5]) {
        expect(typeof w.cues?.countdown[n]).toBe("string");
      }
    }
  });
});
