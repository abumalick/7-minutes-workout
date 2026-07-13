<script lang="ts">
  import { browser } from '$app/environment'
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import WorkoutPicker from '$lib/WorkoutPicker.svelte'
  import { play, playVoice, preload, unlockAudio } from '$lib/sounds'
  import { releaseWakeLock, requestWakeLock } from '$lib/wake-lock'
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
    // Decode every spoken clip up front so the countdown and rest previews play
    // instantly from the timer.
    const voices = workout.steps
      .map((s) => s.voice)
      .filter((v): v is string => Boolean(v))
    const cues = workout.cues
      ? [workout.cues.go, ...Object.values(workout.cues.countdown)]
      : []
    preload([...new Set([...voices, ...cues])])
  }

  function backToPicker() {
    isRunning = false
    selectedId = null
  }

  const currentStep = $derived(selected ? selected.steps[currentIndex] : null)
  const nextStep = $derived(
    selected ? selected.steps[(currentIndex + 1) % selected.steps.length] : null,
  )
  const nextLabel = $derived(nextStep?.label ?? '')
  // Show the current exercise's image; during a rest, preview the next one's.
  const panelImage = $derived(
    currentStep
      ? isRest(currentStep)
        ? nextStep?.image
        : currentStep.image
      : undefined,
  )

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    const step = selected?.steps[currentIndex]
    const workoutCues = selected?.cues
    for (const cue of cues) {
      if (cue === 'instruct') {
        if (step?.voice) playVoice(step.voice)
        else play('start')
      } else if (cue === 'start') {
        if (workoutCues) playVoice(workoutCues.go)
        else play('start')
      } else if (cue === 'tick') {
        // `timeLeft + 1` is the number the user just saw (5..1). Exercises count the
        // full last 5s to "stop"; a rest speaks only its last 3s as a "get ready",
        // landing after the rest's spoken instruction.
        const n = timeLeft + 1
        const inRest = step ? isRest(step) : false
        if (workoutCues && (!inRest || n <= 3)) playVoice(workoutCues.countdown[n])
        else if (!workoutCues) play('tick')
      } else {
        play(cue)
      }
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

  // Keep the screen on while running; re-acquire when returning to the tab
  // since the browser drops the lock whenever the page is hidden.
  $effect(() => {
    if (!browser || !isRunning) return
    requestWakeLock()
    const onVisible = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      releaseWakeLock()
    }
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
        class="absolute left-4 text-blue-600"
        aria-label="Back to workouts"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="19" x2="5" y1="12" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
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
        image={panelImage}
        onStart={() => {
          unlockAudio()
          apply(start(selected.steps, { currentIndex, timeLeft, isRunning }))
        }}
        onPause={() => (isRunning = false)}
        onReplay={currentStep.voice
          ? () => playVoice(currentStep.voice!)
          : undefined}
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
