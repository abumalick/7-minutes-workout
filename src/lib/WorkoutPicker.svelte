<script lang="ts">
  import type { Workout } from './workout'

  let {
    workouts,
    onSelect,
  }: {
    workouts: Workout[]
    onSelect: (id: string) => void
  } = $props()
</script>

<div class="flex flex-col items-center gap-4 p-8 w-full max-w-sm">
  <h2 class="text-2xl font-bold mb-2">Choose a workout</h2>
  {#each workouts as workout (workout.id)}
    <button
      type="button"
      onclick={() => onSelect(workout.id)}
      class="w-full py-6 px-4 bg-white rounded-2xl shadow text-xl font-bold hover:bg-blue-50"
    >
      {workout.name}
    </button>
  {/each}
</div>
