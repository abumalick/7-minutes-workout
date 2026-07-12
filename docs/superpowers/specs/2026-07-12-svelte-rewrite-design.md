# Svelte Rewrite — Design

**Date:** 2026-07-12
**Status:** Approved

## Goal

Rewrite the "7 Minute Workout" timer from React 19 + TanStack Router onto
**SvelteKit**, in-place in this repo, with **behavior identical** to today.

"Done" means:

- Same screen: title, current exercise, "Up next" during Rest, `MM`-style
  countdown, and previous / play-pause / next controls.
- Same 25-step, 7-minute `WORKOUT_SEQUENCE`.
- Same timer behavior: 1s countdown, auto-advance to the next step, stop after
  the last step.
- Same audio cues: `start` on entering a non-Rest step, `tick` for the last 5
  seconds, `success` on finishing a non-Rest step.
- `bun run dev` / `build` / `serve` / `test` / `lint` all work.
- React, TanStack Router, and Biome are fully removed.

## Decisions (locked)

- **Framework:** SvelteKit (file-based routing, matching the current router setup).
- **Landing:** Replace React in-place — same repo, same git history, same URL.
- **Lint/format:** Prettier + `prettier-plugin-svelte`, ESLint + `eslint-plugin-svelte`,
  type-check via `svelte-check`. Biome removed.
- **Tests:** TDD. Core timer logic extracted to a pure module and covered by a
  vitest unit test written first.
- **Cleanup:** Remove all dead shadcn scaffolding (unused CSS design tokens,
  `src/lib/utils.ts`, `tailwindcss-animate`, `class-variance-authority`, `clsx`,
  `tailwind-merge`) and `.cursorrules`.

## Architecture — thin Svelte shell over pure logic

All progression logic lives in a pure, side-effect-free module so it can be
tested first. The Svelte component only holds state, runs the interval, plays
sounds, and renders.

### File structure

```
src/
  app.html                 SvelteKit shell (replaces index.html; keeps meta/manifest/icons)
  app.css                  Tailwind entry, trimmed (replaces styles.css)
  routes/
    +layout.svelte         imports app.css, renders {@render children()}
    +layout.ts             export const prerender = true
    +page.svelte           the app: state + interval + audio + markup (ex-index.tsx)
  lib/
    workout.ts             sequence + pure transition functions   ← tested
    workout.test.ts        vitest unit tests                      ← written first
    sounds.ts              browser-guarded audio cue players
    WorkoutPanel.svelte    presentational (ex-WorkoutPanel.tsx)
    Controls.svelte        presentational, lucide-svelte icons
    assets/sounds/*.mp3     start/tick/success (moved as-is)
static/                    favicon.ico, logo192/512.png, manifest.json, robots.txt (from public/)
```

### `lib/workout.ts` — pure core

```ts
type WorkoutState = { currentIndex: number; timeLeft: number; isRunning: boolean }
type Cue = 'start' | 'tick' | 'success'
type Transition = { state: WorkoutState; cues: Cue[] }

WORKOUT_SEQUENCE, initialState
tick(s): Transition      // one second: countdown w/ tick cue, or advance (+success/start), stop at end
start(s): Transition     // begin running (+start cue if fresh non-Rest step)
next(s): Transition      // skip forward (+success if leaving active exercise, +start if entering exercise)
prev(s): Transition      // skip back, same cue rules
```

Cue rules mirror the original `index.tsx` exactly (interval callback,
`handleStart`, `handleNext`, `handlePrevious`) — no behavior change, just made
pure. `"Rest"` remains the magic label distinguishing rest from exercise.

### `+page.svelte` — Svelte 5 runes

```
let state = $state(initialState)

$effect(() => {                 // isRunning → setInterval(1s)
  if (!state.isRunning) return  // state read async inside interval, so no re-subscribe churn
  const id = setInterval(() => apply(tick(state)), 1000)
  return () => clearInterval(id)
})

function apply({ state: next, cues }) { state = next; cues.forEach(play) }
```

Control handlers call `start` / `next` / `prev` and `apply(...)`; `apply` plays
each returned cue via `sounds.ts`. `currentWorkout` / `nextWorkoutLabel` are
`$derived`.

### `lib/sounds.ts`

Lazily constructs the three `Audio` objects on first use, guarded by SvelteKit's
`browser` flag so prerender never touches browser APIs. Exposes `play(cue)`.

## Tooling changes

**Remove:** react, react-dom, @tanstack/* , @vitejs/plugin-react, lucide-react,
Biome + `biome.json`, class-variance-authority, clsx, tailwind-merge,
tailwindcss-animate, `src/lib/utils.ts`, `routeTree.gen.ts`, `main.tsx`,
`reportWebVitals.ts`, `.cursorrules`, `index.html`, `public/` (contents moved to
`static/`).

**Add:** @sveltejs/kit, svelte 5, @sveltejs/vite-plugin-svelte,
@sveltejs/adapter-static, lucide-svelte, svelte-check, prettier,
prettier-plugin-svelte, eslint, eslint-plugin-svelte, typescript-eslint,
@testing-library/svelte, `svelte.config.js`, `.prettierrc`, `eslint.config.js`.

**Keep:** bun, Tailwind v4 (`@tailwindcss/vite`), TypeScript strict, vitest
(jsdom), the three mp3 assets.

**Scripts:**

- `dev` / `start` → `vite dev --port 3000`
- `build` → `vite build` (adapter-static + prerender = fully static output)
- `serve` → `vite preview`
- `test` → `vitest run`
- `lint` → `eslint . && svelte-check`
- `format` → `prettier --write .`

`@`-alias replaced by SvelteKit's built-in `$lib`.

**`app.css` trim:** keep `@import "tailwindcss"` and the body font/antialias
reset. Drop the unused shadcn oklch design-token block, `tailwindcss-animate`
plugin, `@custom-variant dark`, and the `@layer base` border/bg rules — nothing
in the app references them (it uses `bg-gray-100`, `text-4xl`, etc. directly).

## TDD flow

1. Write `workout.test.ts`: countdown decrements; `tick` cue only for the last 5
   seconds; advance fires `success` (leaving a non-Rest step) then `start`
   (entering a non-Rest step); wrap-around 24→0; `isRunning` false after the last
   step; `next`/`prev` cue rules; Rest steps emit no cues. Run → **red**.
2. Implement `workout.ts` → **green**.
3. Build the Svelte shell (`sounds.ts`, components, `+page.svelte`, layout,
   config) around the green core.
4. Verify: `bun run dev` in a browser (countdown, cues, controls), plus clean
   `svelte-check` and `eslint`.

## Notes / tradeoffs

- SvelteKit + `prerender` + `adapter-static` produces a fully static build like
  today — no server runtime. Audio is browser-guarded so prerender is safe.
- The pure-reducer split is slightly more structure than a literal port, but it
  is what enables tests-first and keeps `+page.svelte` trivial — justified by the
  TDD choice.

## Resolved questions

- Trim dead shadcn CSS tokens + `lib/utils.ts` → **yes, remove.**
- `.cursorrules` → **remove.**
