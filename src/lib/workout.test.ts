import { describe, expect, it } from "vitest";
import { isRest, next, prev, start, tick, type WorkoutState } from "./workout";
import { sevenMinuteWorkout } from "./workouts";

const S = sevenMinuteWorkout.steps;

const at = (currentIndex: number, timeLeft: number, isRunning = true): WorkoutState => ({
  currentIndex,
  timeLeft,
  isRunning,
});

describe("sequence", () => {
  it("has 26 steps opening with a Rest, then alternating 10s Rests", () => {
    expect(S).toHaveLength(26);
    expect(isRest(S[0])).toBe(true);
    expect(isRest(S[1])).toBe(false);
    expect(isRest(S[25])).toBe(false);
  });
});

describe("grouped holds", () => {
  // Exercise "a" is two 10s holds split by a 5s pause; exercise "b" is one step.
  const G = [
    { label: "Rest", duration: 10, voice: "a.mp3", group: "a" },
    { label: "A 1/2", duration: 10, voice: "a.mp3", group: "a" },
    { label: "Rest", duration: 5, group: "a" },
    { label: "A 2/2", duration: 10, voice: "a.mp3", group: "a" },
    { label: "Rest", duration: 10, voice: "b.mp3", group: "b" },
    { label: "B", duration: 30, voice: "b.mp3", group: "b" },
  ];

  it("ends a hold into the pause like any exercise into a rest", () => {
    expect(tick(G, at(1, 0))).toEqual({ state: at(2, 5), cues: ["success", "instruct"] });
  });

  it("next skips the remaining holds of the exercise, from a hold or from a pause", () => {
    expect(next(G, at(1, 4)).state.currentIndex).toBe(4);
    expect(next(G, at(2, 3)).state.currentIndex).toBe(4);
  });

  it("prev lands on the rest before the first hold of the previous exercise", () => {
    expect(prev(G, at(5, 20)).state.currentIndex).toBe(0);
    expect(prev(G, at(4, 10)).state.currentIndex).toBe(0);
  });

  it("prev from a later hold skips the earlier holds of the same exercise", () => {
    expect(prev(G, at(3, 4)).state.currentIndex).toBe(4);
  });
});

describe("tick", () => {
  it("counts down without cues above the last 5 seconds", () => {
    expect(tick(S, at(1, 30))).toEqual({ state: at(1, 29), cues: [] });
    expect(tick(S, at(1, 6))).toEqual({ state: at(1, 5), cues: [] });
  });

  it("emits a tick cue for each of the last 5 seconds", () => {
    expect(tick(S, at(1, 5))).toEqual({ state: at(1, 4), cues: ["tick"] });
    expect(tick(S, at(1, 1))).toEqual({ state: at(1, 0), cues: ["tick"] });
  });

  it("advances exercise -> rest with success then instruct (rest previews next)", () => {
    expect(tick(S, at(1, 0))).toEqual({
      state: at(2, 10),
      cues: ["success", "instruct"],
    });
  });

  it("advances rest -> exercise with a start cue only (instruction already previewed)", () => {
    expect(tick(S, at(2, 0))).toEqual({ state: at(3, 30), cues: ["start"] });
  });

  it("starts the workout from the opening rest with a start cue only", () => {
    expect(tick(S, at(0, 0))).toEqual({ state: at(1, 30), cues: ["start"] });
  });

  it("wraps after the last step, stops running, emits success only", () => {
    expect(tick(S, at(25, 0))).toEqual({
      state: at(0, 10, false),
      cues: ["success"],
    });
  });
});

describe("start", () => {
  it("starts running and cues instruct at the beginning of an exercise", () => {
    expect(start(S, at(1, 30, false))).toEqual({
      state: at(1, 30, true),
      cues: ["instruct"],
    });
  });

  it("starts running with no cue mid-exercise", () => {
    expect(start(S, at(1, 20, false))).toEqual({
      state: at(1, 20, true),
      cues: [],
    });
  });

  it("starts running and cues instruct at the beginning of the opening Rest", () => {
    expect(start(S, at(0, 10, false))).toEqual({
      state: at(0, 10, true),
      cues: ["instruct"],
    });
  });
});

describe("next", () => {
  it("lands on the Rest before the next exercise, success leaving and instruct entering", () => {
    expect(next(S, at(1, 30))).toEqual({
      state: at(2, 10),
      cues: ["success", "instruct"],
    });
  });

  it("from a rest, advances to the next exercise's rest with no success", () => {
    expect(next(S, at(0, 10))).toEqual({ state: at(2, 10), cues: ["instruct"] });
  });

  it("wraps to the opening rest and preserves isRunning", () => {
    expect(next(S, at(25, 30, false))).toEqual({
      state: at(0, 10, false),
      cues: ["success", "instruct"],
    });
  });
});

describe("prev", () => {
  it("wraps backward to the last exercise's rest, success then instruct", () => {
    expect(prev(S, at(1, 30))).toEqual({
      state: at(24, 10),
      cues: ["success", "instruct"],
    });
  });

  it("lands on the Rest before the previous exercise, success leaving and instruct entering", () => {
    expect(prev(S, at(3, 30))).toEqual({
      state: at(0, 10),
      cues: ["success", "instruct"],
    });
  });
});
