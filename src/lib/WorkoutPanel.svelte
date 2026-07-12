<script lang="ts">
  import Controls from './Controls.svelte'

  let {
    currentWorkoutLabel,
    timeLeft,
    isRunning,
    nextWorkoutLabel,
    image,
    onStart,
    onPause,
    onNext,
    onPrevious,
    onReplay,
  }: {
    currentWorkoutLabel: string
    timeLeft: number
    isRunning: boolean
    nextWorkoutLabel?: string
    image?: string
    onStart: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
    onReplay?: () => void
  } = $props()
</script>

<div class="flex flex-col items-center justify-center p-8">
  {#if image}
    <img
      src={image}
      alt=""
      class="mb-4 h-48 w-48 object-contain sm:h-64 sm:w-64"
    />
  {/if}
  <h2 class="text-4xl font-bold">{currentWorkoutLabel}</h2>
  {#if nextWorkoutLabel}
    <p class="text-xl font-bold text-gray-800 mt-2">
      Up next: {nextWorkoutLabel}
    </p>
  {/if}
  <div class="text-6xl font-mono mb-8 mt-4">
    {String(timeLeft).padStart(2, '0')}s
  </div>
  <Controls {isRunning} {onStart} {onPause} {onNext} {onPrevious} {onReplay} />
</div>
