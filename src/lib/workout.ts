export type WorkoutStep = {
  label: string;
  duration: number;
  voice?: string;
  image?: string;
};
// Shared spoken instructor cues: the "go" said as an exercise begins and the
// countdown numbers keyed by the seconds shown (1..5).
export type WorkoutCues = { go: string; countdown: Record<number, string> };
export type Workout = {
  id: string;
  name: string;
  steps: WorkoutStep[];
  cues?: WorkoutCues;
};
export type WorkoutState = {
  currentIndex: number;
  timeLeft: number;
  isRunning: boolean;
};
export type Cue = "start" | "tick" | "success" | "instruct";
export type Transition = { state: WorkoutState; cues: Cue[] };

const REST = "Rest";

export const isRest = (step: { label: string }): boolean => step.label === REST;

const advance = (steps: WorkoutStep[], i: number): number => (i + 1) % steps.length;
const retreat = (steps: WorkoutStep[], i: number): number => (i - 1 + steps.length) % steps.length;

// Manual skip lands on the next/previous exercise, hopping over any Rest steps.
const nextExercise = (steps: WorkoutStep[], i: number): number => {
  let j = advance(steps, i);
  while (isRest(steps[j]) && j !== i) j = advance(steps, j);
  return j;
};
const prevExercise = (steps: WorkoutStep[], i: number): number => {
  let j = retreat(steps, i);
  while (isRest(steps[j]) && j !== i) j = retreat(steps, j);
  return j;
};

export function tick(steps: WorkoutStep[], s: WorkoutState): Transition {
  if (s.timeLeft > 0) {
    const cues: Cue[] = s.timeLeft <= 5 ? ["tick"] : [];
    return { state: { ...s, timeLeft: s.timeLeft - 1 }, cues };
  }
  const toIndex = advance(steps, s.currentIndex);
  const completed = s.currentIndex === steps.length - 1;
  const cues: Cue[] = [];
  // Finishing an exercise chimes; a Rest previews the next exercise's instruction,
  // while the exercise itself only signals "go". A finished workout does neither.
  if (!isRest(steps[s.currentIndex])) cues.push("success");
  if (!completed) cues.push(isRest(steps[toIndex]) ? "instruct" : "start");
  return {
    state: {
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
      isRunning: completed ? false : s.isRunning,
    },
    cues,
  };
}

export function start(steps: WorkoutStep[], s: WorkoutState): Transition {
  // At the very start of a step, speak its instruction (the first exercise has no
  // preceding Rest to preview it); a mid-step resume stays silent.
  const atStepStart = s.timeLeft === steps[s.currentIndex].duration;
  const cues: Cue[] = atStepStart ? ["instruct"] : [];
  return { state: { ...s, isRunning: true }, cues };
}

// Manual skip lands directly on an exercise, hopping its Rest preview — so speak that
// exercise's instruction (not just "go"), plus a success chime if leaving a live exercise.
function skip(steps: WorkoutStep[], s: WorkoutState, toIndex: number): Transition {
  const cues: Cue[] = [];
  if (s.timeLeft > 0 && !isRest(steps[s.currentIndex])) cues.push("success");
  cues.push("instruct");
  return {
    state: {
      ...s,
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
    },
    cues,
  };
}

export function next(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, nextExercise(steps, s.currentIndex));
}

export function prev(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, prevExercise(steps, s.currentIndex));
}
