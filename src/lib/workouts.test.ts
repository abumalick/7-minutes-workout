import { describe, expect, it } from "vitest";
import { isRest } from "./workout";
import { backPainWorkout, buildWorkout } from "./workouts";

describe("backPainWorkout", () => {
  const steps = backPainWorkout.steps;

  it("gives every exercise a voice and no rest a voice", () => {
    for (const step of steps) {
      if (isRest(step)) expect(step.voice).toBeUndefined();
      else expect(typeof step.voice).toBe("string");
    }
  });

  it("gives every exercise an image and no rest an image", () => {
    for (const step of steps) {
      if (isRest(step)) expect(step.image).toBeUndefined();
      else expect(typeof step.image).toBe("string");
    }
  });

  it("starts and ends on an exercise with 10s rests only between exercises", () => {
    expect(isRest(steps[0])).toBe(false);
    expect(isRest(steps[steps.length - 1])).toBe(false);
    steps.forEach((step, i) => {
      if (isRest(step)) {
        expect(step.duration).toBe(10);
        expect(isRest(steps[i - 1])).toBe(false);
        expect(isRest(steps[i + 1])).toBe(false);
      }
    });
  });

  it("has 19 exercises", () => {
    expect(steps.filter((s) => !isRest(s))).toHaveLength(19);
  });
});

describe("buildWorkout", () => {
  it("interleaves a 10s Rest before every exercise except the first", () => {
    const w = buildWorkout("back-pain", "X", [
      { slug: "06-piriforme-gauche", label: "A", duration: 30, text: "" },
      { slug: "07-piriforme-droit", label: "B", duration: 30, text: "" },
    ]);
    expect(w.steps.map((s) => s.label)).toEqual(["A", "Rest", "B"]);
    expect(w.steps[1].duration).toBe(10);
    expect(typeof w.steps[0].voice).toBe("string");
    expect(typeof w.steps[0].image).toBe("string");
  });

  it("throws on a slug with no matching asset", () => {
    expect(() =>
      buildWorkout("back-pain", "X", [{ slug: "nope", label: "A", duration: 30, text: "" }]),
    ).toThrow();
  });
});
