<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import WorkoutPicker from '$lib/WorkoutPicker.svelte'
  import { play, playVoice } from '$lib/sounds'
  import {
    isRest,
    next,
    prev,
    start,
    tick,
    type Transition,
  } from '$lib/workout'
  import { WORKOUTS } from '$lib/workouts'

  let selectedId = $state<string | null>(null)
  const selected = $derived(WORKOUTS.find((w) => w.id === selectedId) ?? null)

  let currentIndex = $state(0)
  let timeLeft = $state(0)
  let isRunning = $state(false)

  function selectWorkout(id: string) {
    const workout = WORKOUTS.find((w) => w.id === id)!
    selectedId = id
    currentIndex = 0
    timeLeft = workout.steps[0].duration
    isRunning = false
  }

  function backToPicker() {
    isRunning = false
    selectedId = null
  }

  const currentStep = $derived(selected ? selected.steps[currentIndex] : null)
  const nextLabel = $derived(
    selected
      ? selected.steps[(currentIndex + 1) % selected.steps.length].label
      : '',
  )

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    const step = selected?.steps[currentIndex]
    for (const cue of cues) {
      if (cue === 'start' && step?.voice) playVoice(step.voice)
      else play(cue)
    }
  }

  // Only `isRunning`/`selected` are read synchronously, so the interval is
  // created/torn down when running toggles — not on every tick.
  $effect(() => {
    if (!isRunning || !selected) return
    const steps = selected.steps
    const id = setInterval(
      () => apply(tick(steps, { currentIndex, timeLeft, isRunning })),
      1000,
    )
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header
    class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10 flex items-center justify-center"
  >
    {#if selected}
      <button
        type="button"
        onclick={backToPicker}
        class="absolute left-4 text-blue-600 font-bold"
        aria-label="Back to workouts"
      >
        ← Retour
      </button>
    {/if}
    <h1 class="text-3xl font-bold text-center">
      {selected ? selected.name : 'Workouts'}
    </h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    {#if selected && currentStep}
      <WorkoutPanel
        currentWorkoutLabel={currentStep.label}
        {timeLeft}
        {isRunning}
        nextWorkoutLabel={isRest(currentStep) ? nextLabel : undefined}
        onStart={() =>
          apply(start(selected.steps, { currentIndex, timeLeft, isRunning }))}
        onPause={() => (isRunning = false)}
        onNext={() =>
          apply(next(selected.steps, { currentIndex, timeLeft, isRunning }))}
        onPrevious={() =>
          apply(prev(selected.steps, { currentIndex, timeLeft, isRunning }))}
      />
    {:else}
      <WorkoutPicker workouts={WORKOUTS} onSelect={selectWorkout} />
    {/if}
  </main>
</div>
