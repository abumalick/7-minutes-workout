# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page workout timer built with SvelteKit, Svelte 5 (runes), Vite, and Tailwind CSS v4. The app is one prerendered route: pick a workout, then run a timed exercise sequence with start/pause/next/previous controls and audio cues. Two workouts ship — a "7 Minute Workout" and a French back-pain mobility routine whose exercises speak a spoken instruction when they start.

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
- **Pure logic in `src/lib/workout.ts`**: side-effect-free transitions `tick`/`start`/`next`/`prev`, each taking `(steps: WorkoutStep[], state: WorkoutState)` and returning a `Transition` (`{ state, cues }`) — the next state plus the audio `Cue`s to fire. A `WorkoutStep` is `{ label, duration, voice? }`; a `Workout` is `{ id, name, steps }`. Fully unit-tested in `src/lib/workout.test.ts` with no DOM.
- **Workout data in `src/lib/workouts.ts`**: the `WORKOUTS` registry (`sevenMinuteWorkout`, `backPainWorkout`). `backPainWorkout` is built from `src/lib/back-pain-instructions.ts` (18 exercises, each with French `text`, `duration`, and a `slug`), interleaving 10s `Rest` steps and attaching each exercise's voice mp3 (resolved via `import.meta.glob` over `src/lib/assets/voice/back-pain/`). Well-formedness is checked in `src/lib/workouts.test.ts`.
- **Thin shell in `src/routes/+page.svelte`**: a `selectedId` rune drives a `WorkoutPicker` until a workout is chosen; then `currentIndex`/`timeLeft`/`isRunning` runes run the selected workout's `steps`, with a "← Retour" control back to the picker. One `$effect` runs a 1-second `setInterval` while `isRunning` (only `isRunning`/`selected` read synchronously, so the interval is created/torn down when running toggles — not per tick). On the `start` cue, the shell plays the current step's `voice` mp3 if it has one, otherwise the `start` beep.
- **Audio cues**: `src/lib/sounds.ts` exposes `play(cue)` (lazy `start`/`tick`/`success` from `src/lib/assets/sounds/`) and `playVoice(url)` (per-step voice; stops any in-flight clip before starting the next). Both guarded by SvelteKit's `browser` flag so prerendering never touches browser APIs. `tick` plays for the last 5 seconds of a step; `success` on finishing a non-`Rest` step; `start` (or a `voice`) on entering one. `"Rest"` is a magic label used throughout to distinguish rest from exercise.
- **Voice generation**: `scripts/generate-voice.ts` (run with `bun`) reads `backPainInstructions` and calls the ElevenLabs TTS API (`eleven_multilingual_v2`) to write `src/lib/assets/voice/back-pain/<slug>.mp3` (skips existing unless `--force`). It needs `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID` env vars — **the key is never committed**; the generated mp3s are. The current voice is a premade male (native-French library voices need a paid ElevenLabs plan); swap by re-running with a different `ELEVENLABS_VOICE_ID` and `--force`.
- **Presentational components** live in `src/lib/`: `WorkoutPanel.svelte` and `Controls.svelte` receive values and callbacks via `$props()`. Control icons are inlined SVG (lucide paths) — no icon dependency.

## Conventions

- **Prettier** (with `prettier-plugin-svelte`) for format and **ESLint** (flat config, `eslint-plugin-svelte`) for lint: single quotes, no semicolons, space indentation. Type-checking is `svelte-check`.
- **TypeScript** is strict. `$lib` aliases `src/lib` (SvelteKit built-in).
- Component prop types are inlined as an object type annotation on the `$props()` destructure (no separate `interface`/`type` declarations) — match this style.
- `.svelte-kit/` and `build/` are generated — never edit; both are gitignored and ESLint-ignored.
