<script lang="ts">
  let {
    isRunning,
    onStart,
    onPause,
    onNext,
    onPrevious,
  }: {
    isRunning: boolean
    onStart: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
  } = $props()
</script>

<div class="flex space-x-4">
  <button
    type="button"
    onclick={onPrevious}
    class="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
    aria-label="Previous"
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
      <polygon points="19 20 9 12 19 4 19 20" />
      <line x1="5" x2="5" y1="19" y2="5" />
    </svg>
  </button>
  <button
    type="button"
    onclick={isRunning ? onPause : onStart}
    class="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
    aria-label={isRunning ? 'Pause' : 'Start'}
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
      {#if isRunning}
        <rect x="14" y="4" width="4" height="16" rx="1" />
        <rect x="6" y="4" width="4" height="16" rx="1" />
      {:else}
        <polygon points="6 3 20 12 6 21 6 3" />
      {/if}
    </svg>
  </button>
  <button
    type="button"
    onclick={onNext}
    class="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
    aria-label="Next"
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
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" x2="19" y1="5" y2="19" />
    </svg>
  </button>
</div>
