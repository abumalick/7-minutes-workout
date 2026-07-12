# 7 Minute Workout

A single-page "7 Minute Workout" timer built with SvelteKit and Svelte 5. It runs
a fixed 25-step exercise sequence with a per-step countdown, auto-advance,
start/pause/next/previous controls, and audio cues.

## Getting started

```bash
bun install
bun run dev        # dev server on http://localhost:3000
```

## Commands

- `bun run dev` / `bun run start` — dev server on port 3000
- `bun run build` — static production build (prerendered via `adapter-static`)
- `bun run serve` — preview the production build
- `bun run test` — run the Vitest suite once
- `bun run test -- <path>` — run a single test file (e.g. `bun run test -- src/lib/workout.test.ts`)
- `bun run lint` — ESLint + `svelte-check`
- `bun run format` — Prettier (with `prettier-plugin-svelte`)

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with [Svelte 5](https://svelte.dev/docs/svelte) runes
- [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- TypeScript (strict), [Vitest](https://vitest.dev/)
- ESLint (flat config) + Prettier, bun as the package manager

## How it works

- **`src/lib/workout.ts`** holds the static `WORKOUT_SEQUENCE` and the pure timer
  transitions (`tick`, `start`, `next`, `prev`). Each returns the next state plus
  the audio cues to fire, so it is fully unit-tested (`src/lib/workout.test.ts`)
  with no DOM.
- **`src/routes/+page.svelte`** is a thin shell: three `$state` runes
  (`currentIndex`, `timeLeft`, `isRunning`), one `$effect` that drives a 1-second
  `setInterval` while running, and the markup. It applies transitions and plays
  the returned cues.
- **`src/lib/sounds.ts`** lazily creates the three `Audio` objects (start / tick /
  success), guarded by SvelteKit's `browser` flag so prerendering never touches
  browser APIs.
- **`src/lib/WorkoutPanel.svelte`** and **`src/lib/Controls.svelte`** are
  presentational; control icons are inlined SVG.

`"Rest"` is the label distinguishing rest steps from exercises: the `start` cue
plays on entering a non-Rest step, `tick` plays for the last 5 seconds, and
`success` plays when a non-Rest step finishes.
