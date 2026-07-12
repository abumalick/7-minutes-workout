# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page "7 Minute Workout" timer built with SvelteKit, Svelte 5 (runes), Vite, and Tailwind CSS v4. The entire app is one prerendered route: a timed exercise sequence with start/pause/next/previous controls and audio cues.

## Package manager

This project standardizes on **bun** (`bun.lock`, README uses `bun`/`bunx`). Use bun, not pnpm/npm/yarn, here.

## Commands

- `bun run dev` / `bun run start` — dev server on port 3000
- `bun run build` — static build via `@sveltejs/adapter-static` (the `/` route is prerendered)
- `bun run serve` — preview the production build
- `bun run test` — run Vitest once (jsdom env, globals enabled)
- `bun run test -- <path>` — run a single test file (e.g. `bun run test -- src/lib/workout.test.ts`)
- `bun run lint` — ESLint (`eslint .`) then `svelte-check`
- `bun run format` — Prettier with `prettier-plugin-svelte`

## Architecture

- **Routing**: SvelteKit file-based, in `src/routes/`. `src/routes/+layout.svelte` imports global CSS and renders `{@render children()}`; `src/routes/+layout.ts` sets `prerender = true`. The app is the single `/` route (`+page.svelte`). `$lib` aliases `src/lib`.
- **Pure logic in `src/lib/workout.ts`**: owns `WORKOUT_SEQUENCE` (static `{ label, duration }[]`) and side-effect-free transitions `tick`/`start`/`next`/`prev`. Each takes a `WorkoutState` (`{ currentIndex, timeLeft, isRunning }`) and returns a `Transition` (`{ state, cues }`) — the next state plus the audio `Cue`s to fire. Fully unit-tested in `src/lib/workout.test.ts` with no DOM.
- **Thin shell in `src/routes/+page.svelte`**: three `$state` runes (`currentIndex`, `timeLeft`, `isRunning`), `$derived` for the current/next labels, and one `$effect` that runs a 1-second `setInterval` while `isRunning`. Only `isRunning` is read synchronously in the effect, so the interval is created/torn down when running toggles — not on every tick. Handlers apply a transition and play its cues.
- **Audio cues**: `src/lib/sounds.ts` exposes `play(cue)`, lazily constructing three `Audio` objects (`start`/`tick`/`success`) from mp3 assets in `src/lib/assets/sounds/`, guarded by SvelteKit's `browser` flag so prerendering never touches browser APIs. `tick` plays for the last 5 seconds of a step; `start`/`success` play on entering/finishing non-`Rest` steps. `"Rest"` is a magic label used throughout to distinguish rest from exercise.
- **Presentational components** live in `src/lib/`: `WorkoutPanel.svelte` and `Controls.svelte` receive values and callbacks via `$props()`. Control icons are inlined SVG (lucide paths) — no icon dependency.

## Conventions

- **Prettier** (with `prettier-plugin-svelte`) for format and **ESLint** (flat config, `eslint-plugin-svelte`) for lint: single quotes, no semicolons, space indentation. Type-checking is `svelte-check`.
- **TypeScript** is strict. `$lib` aliases `src/lib` (SvelteKit built-in).
- Component prop types are inlined as an object type annotation on the `$props()` destructure (no separate `interface`/`type` declarations) — match this style.
- `.svelte-kit/` and `build/` are generated — never edit; both are gitignored and ESLint-ignored.
