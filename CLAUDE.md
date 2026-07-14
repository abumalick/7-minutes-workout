# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page workout timer built with SvelteKit, Svelte 5 (runes), Vite, and Tailwind CSS v4. The app is one prerendered route: pick a workout, then run a timed exercise sequence with start/pause/next/previous controls and audio cues. The app is in French; workouts ship as a "7 Minute Workout" (French labels) plus French back-pain mobility routines. Each exercise's spoken instruction plays **during the `Rest` that precedes it** (a preview + prep window) — every exercise, including the first, has a leading rest, and each rest **grows to fit its instruction** (spoken length + a short get-ready) so the voice is never cut off. A shared French "instructor" audio layer speaks "C'est parti !" as an exercise begins and a spoken countdown ("cinq…un") in an exercise's closing seconds; rests are otherwise silent. A ↻ replay control repeats the current instruction, available during both rests and exercises.

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
- **Pure logic in `src/lib/workout.ts`**: side-effect-free transitions `tick`/`start`/`next`/`prev`, each taking `(steps: WorkoutStep[], state: WorkoutState)` and returning a `Transition` (`{ state, cues }`) — the next state plus the audio `Cue`s to fire. A `WorkoutStep` is `{ label, duration, voice?, image? }`; a `Workout` is `{ id, name, steps, cues? }` where `WorkoutCues` is `{ go, countdown }` (spoken-clip URLs). `Cue`s are `start` | `tick` | `success` | `instruct`. Fully unit-tested in `src/lib/workout.test.ts` with no DOM.
- **Workout data in `src/lib/workouts.ts`**: the `WORKOUTS` registry (`sevenMinuteWorkout`, `backPainWorkout`). `backPainWorkout` is assembled by `buildWorkout(id, name, instructions)` from `src/lib/back-pain-instructions.ts` (19 exercises — the unilateral first move is split into left/right; each `ExerciseInstruction` (type in `src/lib/exercise.ts`) carries `slug`, French `label`/`text`, `duration`, and an optional `image: { accent, view, pose }` used only for pictogram generation). `buildWorkout` prefixes **every** exercise — including the first — with a `Rest` step (10s is the data floor; the running shell grows it at runtime, see below) and resolves each exercise's voice mp3 and image png by `id`/`slug` via `import.meta.glob` over `src/lib/assets/voice/**` and `src/lib/assets/images/**` (fail-fast if missing). Each `Rest` carries the **following** exercise's `voice`, so the rest previews (and can replay) that exercise's instruction, and the workout opens on a get-ready rest. Every workout (incl. `sevenMinuteWorkout`, which is hand-defined with a leading rest) is assigned the shared `FR_CUES` set, globbed from `src/lib/assets/voice/cues/fr/`. Manual next/prev land on the `Rest` that **precedes** the target exercise (not the exercise itself), so navigation flows rest → exercise like the normal sequence. Well-formedness is checked in `src/lib/workouts.test.ts`.
- **Thin shell in `src/routes/+page.svelte`**: a `selectedId` rune drives a `WorkoutPicker` until a workout is chosen; then `currentIndex`/`timeLeft`/`isRunning` runes run the selected workout's `steps`, with a "← Retour" control back to the picker. One `$effect` runs a 1-second `setInterval` while `isRunning` (only `isRunning`/`selected` read synchronously, so the interval is created/torn down when running toggles — not per tick). `selectWorkout` `preload`s every spoken clip so timer playback is instant. `apply` maps each transition `Cue` to sound: `instruct` speaks the current step's `voice` (rest = the previewed next exercise; falls back to the `start` beep if the step has no voice) — and when the step is a rest, **grows `timeLeft`** to `max(step.duration, ceil(voiceDuration) + GET_READY_SECONDS)` so the rest lasts long enough to speak the full instruction; `start` plays the workout's `cues.go` ("C'est parti !"); `tick` speaks `cues.countdown[timeLeft + 1]` **only during exercises** (the full last 5s, "cinq…un") — rests stay silent so the instruction preview is never interrupted; `success` chimes.
- **Audio cues**: `src/lib/sounds.ts` exposes `play(cue)` (lazy `start`/`tick`/`success` from `src/lib/assets/sounds/`, via fixed-`src` `HTMLAudioElement`s) plus a **Web Audio** voice layer — `playVoice(url)` (decoded-buffer playback; stops any in-flight clip first), `preload(list)` (decode ahead of time), and `voiceDuration(url)` (decoded length, for rest sizing). All guarded by SvelteKit's `browser` flag so prerendering never touches browser APIs. The spoken instruction and the French `cues` clips go through `playVoice`; `play` covers only the file-backed cues (`start`/`tick`/`success`, typed `SoundCue`). **Why Web Audio for voice:** iOS Safari blocks a timer-driven `play()` after an `<audio>` `src` swap outside a user gesture, so the old single reused element only ever spoke the first, in-gesture instruction. An `AudioContext` resumed inside the Start-tap gesture (`unlockAudio`) plays any decoded buffer from a timer. The pure logic emits `success` on finishing an exercise, `start` when an exercise auto-begins after its rest preview, `instruct` when a step's instruction should be spoken (entering a rest, manual skip onto a rest, or first Start), and `tick` in the last 5 s of a step. `"Rest"` is a magic label used throughout to distinguish rest from exercise.
- **Generation scripts are id-parameterized**: `scripts/generate-voice.ts <id>`, `scripts/generate-images.ts <id>`, and `scripts/build-gallery.ts <id>` each take a workout `id`, dynamically import `src/lib/<id>-instructions.ts`, and read/write that workout's `assets/{voice,images}/<id>/` (run with `node scripts/…ts` — Node 24 strips TS types natively; all skip existing unless `--force`). `generate-voice` calls ElevenLabs (`eleven_multilingual_v2`) speaking `"<name>. <instruction>"`; needs `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` (default premade male — native-French library voices need a paid plan). `scripts/generate-cues.ts` (not id-parameterized) generates the shared French instructor cues — `go.mp3` ("C'est parti !") and spoken numbers `1.mp3`–`5.mp3` — into `src/lib/assets/voice/cues/fr/` with the same voice/model/key. `generate-images` calls OpenAI `gpt-image-1` with a fixed two-tone slate/blue "clinical" style preamble + each exercise's `image` pose (3× retry for stochastic moderation); key via `bw get notes "OPENAI API KEY"`. `build-gallery` emits an Artifact-ready themed HTML of the PNGs to `.tmp/gallery-<id>.html`. **Keys are never committed**; generated mp3s/pngs are. The `.claude/skills/workout-from-youtube` skill orchestrates these to add a whole new workout from a YouTube URL.
- **Presentational components** live in `src/lib/`: `WorkoutPanel.svelte` and `Controls.svelte` receive values and callbacks via `$props()`. Control icons are inlined SVG (lucide paths) — no icon dependency.

## Dev workflow

App work happens in **one git worktree per task**, each reachable at a stable portless URL. The main working tree stays clean.

> **HARD RULE — no app/code changes on `main`'s working tree.** Every task that touches application code starts by creating a worktree: `git worktree add .worktrees/<branch> -b <branch>`. Do all editing, verifying, and committing there, then merge back per the Per-task loop below. "App/code" means anything under `src/`, `scripts/`, `static/`, assets, `*.config.*`, `package.json`/`pnpm-lock.yaml`, or `.githooks/`.
>
> **Exception — doc-only changes may be committed directly on `main`:** Markdown files (`*.md`, e.g. `CLAUDE.md`, `README`) and anything under `docs/`. Nothing else. If a change mixes docs and code, it's a code change → worktree.
>
> If you catch yourself having already edited app files on `main`, stop and move the change into a worktree (`git stash push <files>` on `main` → `git worktree add … -b <branch>` → `git stash pop` in the worktree) before continuing.

### Assumptions

- **Toolchain is mise-managed** (`node`, `pnpm`, `portless`, `vp` via shims at `~/.local/share/mise/shims`). **This machine _is_ the `dev` host.** Dev servers register with the **shared** systemd `portless-dev.service` (the `@abumalick/portless` fork run via the mise shim, `--port 8447 --no-tls --tld dev.sageplex.com`, state dir `~/.portless-dev`), sitting behind Caddy which terminates TLS with a publicly-trusted Let's Encrypt cert. The agent never starts or stops the proxy — it is a service; if it's down, tell the user rather than starting it.
- **Local dev URLs use `*.dev.sageplex.com` (trusted HTTPS, no CA install).** Hosts are a **single label**: a worktree on branch `feat/foo` resolves to `https://my-workout-foo.dev.sageplex.com`; `main` resolves to `https://my-workout.dev.sageplex.com`. The base label `my-workout` comes from `package.json` `"portless"`; the leaf is the branch's last `/`-separated segment (sanitized: lowercase, non-`[a-z0-9-]`→`-`); on `main` the suffix is dropped. **Collision risk:** two branches sharing a leaf (`feat/foo` and `fix/foo`) collide on the same URL — pick unique leaves.
- **Start the dev server with `bash scripts/dev-server.sh`** (run it directly, NOT via `pnpm run …`). It registers the route with the proxy, binds Vite to IPv4 `127.0.0.1` (the proxy dials IPv4; `[::1]` → 502), strips the leaked `npm_*`/`PNPM_*` env the fork rejects, and points at the `~/.portless-dev` state dir. Don't hand-roll `portless run`.
- Worktrees live at `.worktrees/<branch>/` (gitignored). Branch names follow the commit-prefix convention: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Direct merge to `main` + push is the integration model (no GitHub PRs). A merge landing on `main` **auto-deploys** via `.githooks/post-merge` (see below).

### Per-task loop

1. **Create the worktree** from the main repo: `git worktree add .worktrees/<branch> -b <branch>`.
2. **Install + start dev server** inside the worktree: `pnpm install`, then `bash scripts/dev-server.sh` (backgrounded). Report the URL `https://my-workout-<branch-leaf>.dev.sageplex.com`.
3. **Implement** (TDD where it fits — `src/lib/*.ts` logic is fully unit-tested with no DOM).
4. **Gate — verify before merge.** From inside the worktree, run in order; all must pass:
   ```
   pnpm run lint     # vp lint + svelte-check
   pnpm run build
   pnpm test
   ```
5. **Browser check (UI changes only).** If the diff touches `*.svelte`, CSS, or a rendering path, exercise the affected flow against the worktree's portless URL. Skip for pure logic/data/config/test changes.
6. **Merge to `main`** from the main worktree. **Sync to origin first** — the auto-deploy fires on the local merge, so merging a behind `main` deploys a regression (the post-merge freshness guard refuses it, but sync anyway):
   ```
   git checkout main
   git fetch origin && git merge --ff-only origin/main
   git merge --no-ff <branch>
   git push origin main
   ```
7. **Clean up:** `git worktree remove .worktrees/<branch>` && `git branch -d <branch>`.

Bypass the pre-commit gate with `git commit --no-verify` only with a real reason; never skip a failing test by tagging it skip.

## Deployment & git hooks

- **Deploy target**: Cloudflare Worker serving the static `build/` output (assets-only Worker, `wrangler.jsonc`), custom domain `workout.hilson.net`. `pnpm run deploy` builds + `wrangler deploy`.
- **Hooks** live in `.githooks/` (auto-run via the machine's global `core.hooksPath` dispatcher — no per-clone setup). `pre-commit` runs `vp staged` (oxfmt + oxlint + typecheck on staged files) then `svelte-check` then the unit tests. `post-merge` auto-deploys **only on `main`**, with a freshness guard against `origin/main` and a wrangler-auth check.

## Conventions

- **oxfmt** (via `vp fmt`) for format and **oxlint** (via `vp lint`) for lint — configured through the `staged` key in `vite.config.ts`. oxfmt uses double quotes and semicolons (oxc defaults). Svelte-specific type/a11y checking is `svelte-check`.
- **TypeScript** is strict. `$lib` aliases `src/lib` (SvelteKit built-in).
- Component prop types are inlined as an object type annotation on the `$props()` destructure (no separate `interface`/`type` declarations) — match this style.
- `.svelte-kit/` and `build/` are generated — never edit; both are gitignored.
