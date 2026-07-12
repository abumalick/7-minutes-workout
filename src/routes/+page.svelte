<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import { play } from '$lib/sounds'
  import {
    isRest,
    next,
    prev,
    start,
    tick,
    type Transition,
  } from '$lib/workout'
  import { sevenMinuteWorkout } from '$lib/workouts'

  const steps = sevenMinuteWorkout.steps

  let currentIndex = $state(0)
  let timeLeft = $state(steps[0].duration)
  let isRunning = $state(false)

  const currentWorkout = $derived(steps[currentIndex])
  const nextWorkoutLabel = $derived(
    steps[(currentIndex + 1) % steps.length].label,
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
    const id = setInterval(
      () => apply(tick(steps, { currentIndex, timeLeft, isRunning })),
      1000,
    )
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10">
    <h1 class="text-4xl font-bold text-center">{sevenMinuteWorkout.name}</h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    <WorkoutPanel
      currentWorkoutLabel={currentWorkout.label}
      {timeLeft}
      {isRunning}
      nextWorkoutLabel={isRest(currentWorkout) ? nextWorkoutLabel : undefined}
      onStart={() => apply(start(steps, { currentIndex, timeLeft, isRunning }))}
      onPause={() => (isRunning = false)}
      onNext={() => apply(next(steps, { currentIndex, timeLeft, isRunning }))}
      onPrevious={() => apply(prev(steps, { currentIndex, timeLeft, isRunning }))}
    />
  </main>
</div>
