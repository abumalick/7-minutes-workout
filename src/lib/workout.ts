export type WorkoutStep = {
  label: string
  duration: number
  voice?: string
  image?: string
}
export type Workout = { id: string; name: string; steps: WorkoutStep[] }
export type WorkoutState = {
  currentIndex: number
  timeLeft: number
  isRunning: boolean
}
export type Cue = 'start' | 'tick' | 'success'
export type Transition = { state: WorkoutState; cues: Cue[] }

const REST = 'Rest'

export const isRest = (step: { label: string }): boolean => step.label === REST

const advance = (steps: WorkoutStep[], i: number): number =>
  (i + 1) % steps.length
const retreat = (steps: WorkoutStep[], i: number): number =>
  (i - 1 + steps.length) % steps.length

// Manual skip lands on the next/previous exercise, hopping over any Rest steps.
const nextExercise = (steps: WorkoutStep[], i: number): number => {
  let j = advance(steps, i)
  while (isRest(steps[j]) && j !== i) j = advance(steps, j)
  return j
}
const prevExercise = (steps: WorkoutStep[], i: number): number => {
  let j = retreat(steps, i)
  while (isRest(steps[j]) && j !== i) j = retreat(steps, j)
  return j
}

// Cues fired when moving off `fromIndex` onto `toIndex`.
// Leaving an active exercise -> success; entering an exercise -> start. Rest emits neither.
const stepCues = (
  steps: WorkoutStep[],
  fromIndex: number,
  toIndex: number,
  leavingActive: boolean,
): Cue[] => {
  const cues: Cue[] = []
  if (leavingActive && !isRest(steps[fromIndex])) cues.push('success')
  if (!isRest(steps[toIndex])) cues.push('start')
  return cues
}

export function tick(steps: WorkoutStep[], s: WorkoutState): Transition {
  if (s.timeLeft > 0) {
    const cues: Cue[] = s.timeLeft <= 5 ? ['tick'] : []
    return { state: { ...s, timeLeft: s.timeLeft - 1 }, cues }
  }
  const toIndex = advance(steps, s.currentIndex)
  const completed = s.currentIndex === steps.length - 1
  return {
    state: {
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
      isRunning: completed ? false : s.isRunning,
    },
    cues: stepCues(steps, s.currentIndex, toIndex, true),
  }
}

export function start(steps: WorkoutStep[], s: WorkoutState): Transition {
  const atStepStart = s.timeLeft === steps[s.currentIndex].duration
  const cues: Cue[] =
    !isRest(steps[s.currentIndex]) && atStepStart ? ['start'] : []
  return { state: { ...s, isRunning: true }, cues }
}

function skip(
  steps: WorkoutStep[],
  s: WorkoutState,
  toIndex: number,
): Transition {
  return {
    state: {
      ...s,
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
    },
    cues: stepCues(steps, s.currentIndex, toIndex, s.timeLeft > 0),
  }
}

export function next(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, nextExercise(steps, s.currentIndex))
}

export function prev(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, prevExercise(steps, s.currentIndex))
}
