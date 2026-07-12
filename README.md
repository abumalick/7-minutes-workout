# 7 Minute Workout

A single-page "7 Minute Workout" timer built with SvelteKit and Svelte 5. It runs
a fixed 25-step exercise sequence with a per-step countdown, auto-advance,
start/pause/next/previous controls, and audio cues.

## Getting started

```bash
mise trust         # once, to allow the pinned toolchain
pnpm install
pnpm dev           # dev server on http://localhost:3000
```

## Commands

- `pnpm dev` / `pnpm start` — dev server on port 3000
- `pnpm run build` — static production build (prerendered via `adapter-static`)
- `pnpm run serve` — preview the production build
- `pnpm test` — run the Vitest suite once
- `pnpm test <path>` — run a single test file (e.g. `pnpm test src/lib/workout.test.ts`)
- `pnpm run lint` — oxlint (`vp lint`) + `svelte-check`
- `pnpm run format` — `vp fmt` (oxfmt)
- `pnpm run deploy` — build + deploy to Cloudflare (`workout.hilson.net`)

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with [Svelte 5](https://svelte.dev/docs/svelte) runes
- [Vite](https://vitejs.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- TypeScript (strict), [Vitest](https://vitest.dev/)
- [vite-plus](https://www.npmjs.com/package/vite-plus) (`vp` — oxfmt + oxlint), pnpm as the package manager, deployed as a Cloudflare Worker

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
