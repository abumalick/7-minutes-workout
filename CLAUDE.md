# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page workout timer built with SvelteKit, Svelte 5 (runes), Vite, and Tailwind CSS v4. The app is one prerendered route: pick a workout, then run a timed exercise sequence with start/pause/next/previous controls and audio cues. Two workouts ship — a "7 Minute Workout" and a French back-pain mobility routine whose exercises speak a spoken instruction when they start.

## Package manager & toolchain

This project standardizes on **pnpm** (`pnpm-lock.yaml`, `packageManager` field). Use pnpm, not bun/npm/yarn. Node is pinned via `mise.toml` (also pins `npm:vite-plus`); run `mise trust` once in a fresh clone. Formatting/linting is **vite-plus** (`vp` → oxfmt + oxlint), not prettier/eslint. `pnpm-workspace.yaml` `allowBuilds` approves the native build scripts (esbuild, sharp) so `pnpm install` exits 0.

## Commands

- `pnpm dev` / `pnpm start` — dev server on port 3000
- `pnpm run build` — static build via `@sveltejs/adapter-static` (the `/` route is prerendered)
- `pnpm run serve` — preview the production build
- `pnpm test` — run Vitest once (jsdom env, globals enabled)
- `pnpm test <path>` — run a single test file (e.g. `pnpm test src/lib/workout.test.ts`)
- `pnpm run lint` — oxlint (`vp lint`) then `svelte-check`
- `pnpm run format` — `vp fmt` (oxfmt)
- `pnpm run check` — `vp check` (format + lint + typecheck)
- `pnpm run deploy` — build then `wrangler deploy` (Cloudflare Worker)

## Architecture

- **Routing**: SvelteKit file-based, in `src/routes/`. `src/routes/+layout.svelte` imports global CSS and renders `{@render children()}`; `src/routes/+layout.ts` sets `prerender = true`. The app is the single `/` route (`+page.svelte`). `$lib` aliases `src/lib`.
- **Pure logic in `src/lib/workout.ts`**: side-effect-free transitions `tick`/`start`/`next`/`prev`, each taking `(steps: WorkoutStep[], state: WorkoutState)` and returning a `Transition` (`{ state, cues }`) — the next state plus the audio `Cue`s to fire. A `WorkoutStep` is `{ label, duration, voice?, image? }`; a `Workout` is `{ id, name, steps }`. Fully unit-tested in `src/lib/workout.test.ts` with no DOM.
- **Workout data in `src/lib/workouts.ts`**: the `WORKOUTS` registry (`sevenMinuteWorkout`, `backPainWorkout`). `backPainWorkout` is assembled by `buildWorkout(id, name, instructions)` from `src/lib/back-pain-instructions.ts` (19 exercises — the unilateral first move is split into left/right; each `ExerciseInstruction` (type in `src/lib/exercise.ts`) carries `slug`, French `label`/`text`, `duration`, and an optional `image: { accent, view, pose }` used only for pictogram generation). `buildWorkout` interleaves 10s `Rest` steps and resolves each exercise's voice mp3 and image png by `id`/`slug` via `import.meta.glob` over `src/lib/assets/voice/**` and `src/lib/assets/images/**` (fail-fast if missing). Manual next/prev skip Rest steps. Well-formedness is checked in `src/lib/workouts.test.ts`.
- **Thin shell in `src/routes/+page.svelte`**: a `selectedId` rune drives a `WorkoutPicker` until a workout is chosen; then `currentIndex`/`timeLeft`/`isRunning` runes run the selected workout's `steps`, with a "← Retour" control back to the picker. One `$effect` runs a 1-second `setInterval` while `isRunning` (only `isRunning`/`selected` read synchronously, so the interval is created/torn down when running toggles — not per tick). On the `start` cue, the shell plays the current step's `voice` mp3 if it has one, otherwise the `start` beep.
- **Audio cues**: `src/lib/sounds.ts` exposes `play(cue)` (lazy `start`/`tick`/`success` from `src/lib/assets/sounds/`) and `playVoice(url)` (per-step voice; stops any in-flight clip before starting the next). Both guarded by SvelteKit's `browser` flag so prerendering never touches browser APIs. `tick` plays for the last 5 seconds of a step; `success` on finishing a non-`Rest` step; `start` (or a `voice`) on entering one. `"Rest"` is a magic label used throughout to distinguish rest from exercise.
- **Generation scripts are id-parameterized**: `scripts/generate-voice.ts <id>`, `scripts/generate-images.ts <id>`, and `scripts/build-gallery.ts <id>` each take a workout `id`, dynamically import `src/lib/<id>-instructions.ts`, and read/write that workout's `assets/{voice,images}/<id>/` (run with `node scripts/…ts` — Node 24 strips TS types natively; all skip existing unless `--force`). `generate-voice` calls ElevenLabs (`eleven_multilingual_v2`) speaking `"<name>. <instruction>"`; needs `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` (default premade male — native-French library voices need a paid plan). `generate-images` calls OpenAI `gpt-image-1` with a fixed two-tone slate/blue "clinical" style preamble + each exercise's `image` pose (3× retry for stochastic moderation); key via `bw get notes "OPENAI API KEY"`. `build-gallery` emits an Artifact-ready themed HTML of the PNGs to `.tmp/gallery-<id>.html`. **Keys are never committed**; generated mp3s/pngs are. The `.claude/skills/workout-from-youtube` skill orchestrates these to add a whole new workout from a YouTube URL.
- **Presentational components** live in `src/lib/`: `WorkoutPanel.svelte` and `Controls.svelte` receive values and callbacks via `$props()`. Control icons are inlined SVG (lucide paths) — no icon dependency.

## Deployment & git hooks

- **Deploy target**: Cloudflare Worker serving the static `build/` output (assets-only Worker, `wrangler.jsonc`), custom domain `workout.hilson.net`. `pnpm run deploy` builds + `wrangler deploy`.
- **Hooks** live in `.githooks/` (auto-run via the machine's global `core.hooksPath` dispatcher — no per-clone setup). `pre-commit` runs `vp staged` (oxfmt + oxlint + typecheck on staged files) then `svelte-check` then the unit tests. `post-merge` auto-deploys **only on `main`**, with a freshness guard against `origin/main` and a wrangler-auth check.

## Conventions

- **oxfmt** (via `vp fmt`) for format and **oxlint** (via `vp lint`) for lint — configured through the `staged` key in `vite.config.ts`. oxfmt uses double quotes and semicolons (oxc defaults). Svelte-specific type/a11y checking is `svelte-check`.
- **TypeScript** is strict. `$lib` aliases `src/lib` (SvelteKit built-in).
- Component prop types are inlined as an object type annotation on the `$props()` destructure (no separate `interface`/`type` declarations) — match this style.
- `.svelte-kit/` and `build/` are generated — never edit; both are gitignored.
