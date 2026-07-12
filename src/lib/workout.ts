export type WorkoutStep = { label: string; duration: number }
export type WorkoutState = { currentIndex: number; timeLeft: number; isRunning: boolean }
export type Cue = 'start' | 'tick' | 'success'
export type Transition = { state: WorkoutState; cues: Cue[] }

const REST = 'Rest'

export const WORKOUT_SEQUENCE: WorkoutStep[] = [
  { label: 'Jumping Jacks', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Wall Sit', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Push-ups', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Abdominal Crunch', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Step-up onto Chair', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Squats', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Triceps Dip on Chair', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Plank', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'High Knees Running in Place', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Lunges', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Push-up and Rotation', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Side Plank (Left)', duration: 30 },
  { label: 'Rest', duration: 10 },
  { label: 'Side Plank (Right)', duration: 30 },
]

export const isRest = (step: { label: string }): boolean => step.label === REST

const advance = (i: number): number => (i + 1) % WORKOUT_SEQUENCE.length
const retreat = (i: number): number => (i - 1 + WORKOUT_SEQUENCE.length) % WORKOUT_SEQUENCE.length

// Cues fired when moving off `fromIndex` onto `toIndex`.
// Leaving an active exercise -> success; entering an exercise -> start. Rest emits neither.
const stepCues = (fromIndex: number, toIndex: number, leavingActive: boolean): Cue[] => {
  const cues: Cue[] = []
  if (leavingActive && !isRest(WORKOUT_SEQUENCE[fromIndex])) cues.push('success')
  if (!isRest(WORKOUT_SEQUENCE[toIndex])) cues.push('start')
  return cues
}

export function tick(s: WorkoutState): Transition {
  if (s.timeLeft > 0) {
    const cues: Cue[] = s.timeLeft <= 5 ? ['tick'] : []
    return { state: { ...s, timeLeft: s.timeLeft - 1 }, cues }
  }
  const toIndex = advance(s.currentIndex)
  const completed = s.currentIndex === WORKOUT_SEQUENCE.length - 1
  return {
    state: {
      currentIndex: toIndex,
      timeLeft: WORKOUT_SEQUENCE[toIndex].duration,
      isRunning: completed ? false : s.isRunning,
    },
    cues: stepCues(s.currentIndex, toIndex, true),
  }
}

export function start(s: WorkoutState): Transition {
  const atStepStart = s.timeLeft === WORKOUT_SEQUENCE[s.currentIndex].duration
  const cues: Cue[] = !isRest(WORKOUT_SEQUENCE[s.currentIndex]) && atStepStart ? ['start'] : []
  return { state: { ...s, isRunning: true }, cues }
}

function skip(s: WorkoutState, toIndex: number): Transition {
  return {
    state: { ...s, currentIndex: toIndex, timeLeft: WORKOUT_SEQUENCE[toIndex].duration },
    cues: stepCues(s.currentIndex, toIndex, s.timeLeft > 0),
  }
}

export function next(s: WorkoutState): Transition {
  return skip(s, advance(s.currentIndex))
}

export function prev(s: WorkoutState): Transition {
  return skip(s, retreat(s.currentIndex))
}
