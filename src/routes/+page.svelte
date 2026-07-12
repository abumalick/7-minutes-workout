<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import { play } from '$lib/sounds'
  import { WORKOUT_SEQUENCE, isRest, next, prev, start, tick, type Transition } from '$lib/workout'

  let currentIndex = $state(0)
  let timeLeft = $state(WORKOUT_SEQUENCE[0].duration)
  let isRunning = $state(false)

  const currentWorkout = $derived(WORKOUT_SEQUENCE[currentIndex])
  const nextWorkoutLabel = $derived(
    WORKOUT_SEQUENCE[(currentIndex + 1) % WORKOUT_SEQUENCE.length].label,
  )

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    for (const cue of cues) play(cue)
  }

  // Only `isRunning` is read synchronously, so the interval is created/torn down
  // exactly when running toggles — not on every tick.
  $effect(() => {
    if (!isRunning) return
    const id = setInterval(() => apply(tick({ currentIndex, timeLeft, isRunning })), 1000)
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10">
    <h1 class="text-4xl font-bold text-center">7 Minute Workout</h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    <WorkoutPanel
      currentWorkoutLabel={currentWorkout.label}
      {timeLeft}
      {isRunning}
      nextWorkoutLabel={isRest(currentWorkout) ? nextWorkoutLabel : undefined}
      onStart={() => apply(start({ currentIndex, timeLeft, isRunning }))}
      onPause={() => (isRunning = false)}
      onNext={() => apply(next({ currentIndex, timeLeft, isRunning }))}
      onPrevious={() => apply(prev({ currentIndex, timeLeft, isRunning }))}
    />
  </main>
</div>
