# Design: Back-Pain Routine as a Second Workout with Spoken Instructions

**Date:** 2026-07-12
**Status:** Approved (design), pending implementation plan

## Goal

Add a second selectable workout to the app: a back-pain mobility/strengthening routine
adapted from Benjamin Brochet's YouTube video (https://youtu.be/o-Yawof_CgE, see
[`docs/back-pain-routine.md`](../../back-pain-routine.md)). Each exercise plays a concise
**spoken French instruction** (his explanation, cleaned and shortened) when it starts. The
narration is pre-generated with the ElevenLabs TTS API and the resulting mp3s are stored in
the repo.

## Non-goals

- No runtime TTS. Audio is generated once at build/author time and committed.
- No per-set rep counting or side-switch beeps beyond the existing cue sounds.
- No change to the 7-minute workout's behavior (only a signature refactor it passes through).

## Decisions (from brainstorming)

1. **Add as a 2nd workout** with a picker screen — keep the existing 7-minute workout.
2. **French voice**, matching the source. Style: **calm French male**.
3. **Concise instructions** — ~1 sentence per exercise, not his full monologue.
4. **Bilateral stretches split Left/Right** — piriformis, quadratus lumborum, and psoas each
   become two ~30s steps (he explicitly does "3×15s each side" for these). All other
   exercises are single steps.

## Architecture

### Parameterize the workout logic (`src/lib/workout.ts`)

Today the pure transitions (`tick`/`start`/`next`/`prev`) close over a module-global
`WORKOUT_SEQUENCE`. They will be **parameterized to take `steps: WorkoutStep[]`** as their
first argument. This is the only change to existing logic; behavior is identical.

- `WorkoutStep` gains an optional field: `voice?: string` (audio URL). Rest steps and all
  7-minute-workout steps omit it.
- Types (`WorkoutState`, `Cue`, `Transition`) are unchanged.
- Helpers `advance`/`retreat`/`stepCues` take `steps` (or its length) as a parameter.

Signature sketch:

```ts
export type WorkoutStep = { label: string; duration: number; voice?: string }
export type Workout = { id: string; name: string; steps: WorkoutStep[] }

export function tick(steps: WorkoutStep[], s: WorkoutState): Transition
export function start(steps: WorkoutStep[], s: WorkoutState): Transition
export function next(steps: WorkoutStep[], s: WorkoutState): Transition
export function prev(steps: WorkoutStep[], s: WorkoutState): Transition
```

### Workout data (`src/lib/workouts.ts`, new)

Holds the *data*, separate from the pure logic:

- Defines the two `Workout` objects and a `WORKOUTS: Workout[]` registry.
- The 7-minute sequence moves here from `workout.ts` (as `sevenMinuteWorkout`).
- The back-pain sequence (`backPainWorkout`) imports its voice mp3s via Vite the same way
  `sounds.ts` imports cue mp3s (`import hipFlexionUrl from './assets/voice/back-pain/01-flexion-hanche.mp3'`).

### UI — picker without new routes (`src/routes/+page.svelte`)

- Add `selectedWorkoutId: string | null` state (starts `null`).
- When `null`: render a new **`WorkoutPicker.svelte`** — two cards ("7 Minute Workout",
  "Routine mal de dos"). Selecting one sets `selectedWorkoutId` and resets
  `currentIndex/timeLeft/isRunning`.
- When set: the existing `WorkoutPanel` runs, driven by the selected workout's `steps`. A
  "← Retour" control clears `selectedWorkoutId` to return to the picker.
- The header shows the selected workout's `name`.
- Keeps the single prerendered `/` route — no dynamic routing.

### Spoken instructions — playback (`src/lib/sounds.ts` + shell)

The per-exercise voice is dynamic (a different mp3 per step), so it is **not** one of the
three fixed cues. Entering an exercise already fires the `'start'` cue. In the shell's
`apply()`:

- If the `'start'` cue fires **and** the current step has a `voice`, play that mp3.
- Otherwise (7-minute workout, or resuming), play the existing `'start'` beep.

`sounds.ts` gains `playVoice(url: string)`, guarded by `browser`, which stops any
currently-playing voice before starting a new one (so a rapid "Next" doesn't overlap two
clips). The `tick` (last 5s) and `success` cues are untouched; the concise voice (~8–12s)
ends well before the tick window.

## Back-pain sequence (18 exercises, 10s rest between, ≈12.5 min)

Durations are authored (chapter gaps in the video are demo time, not hold time).

| # | Label | Duration | Voice slug |
|---|-------|----------|------------|
| 1 | Flexion de hanche | 30 | 01-flexion-hanche |
| 2 | Double flexion de hanche | 30 | 02-double-flexion-hanche |
| 3 | Pont fessier | 30 | 03-pont-fessier |
| 4 | Lordose – cyphose | 30 | 04-lordose-cyphose |
| 5 | Rotation lombaire | 30 | 05-rotation |
| 6 | Piriforme (gauche) | 30 | 06-piriforme-gauche |
| 7 | Piriforme (droit) | 30 | 07-piriforme-droit |
| 8 | Carré des lombes (gauche) | 30 | 08-carre-lombes-gauche |
| 9 | Carré des lombes (droit) | 30 | 09-carre-lombes-droit |
| 10 | Prière | 30 | 10-priere |
| 11 | Dos de chat | 30 | 11-dos-de-chat |
| 12 | Gainage alterné | 30 | 12-gainage-alterne |
| 13 | Extension vertébrale | 30 | 13-extension-vertebrale |
| 14 | Plan postérieur | 40 | 14-plan-posterieur |
| 15 | Psoas iliaque (gauche) | 30 | 15-psoas-gauche |
| 16 | Psoas iliaque (droit) | 30 | 16-psoas-droit |
| 17 | Face antérieure | 30 | 17-anterieure |
| 18 | Accroupi | 60 | 18-accroupi |

`Rest` (10s) is inserted between consecutive exercises; no leading or trailing rest.

### Instruction text (concise French, faithful to his explanations)

1. **Flexion de hanche** — «Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.»
2. **Double flexion de hanche** — «Ramenez les deux genoux vers la poitrine et ajoutez de petites rotations pour détendre la région lombaire.»
3. **Pont fessier** — «Levez les fesses pour renforcer les fessiers, puis redéroulez la colonne vertèbre par vertèbre, du haut vers le bas.»
4. **Lordose – cyphose** — «À l'inspiration, cambrez le dos; à l'expiration, plaquez le bas du dos sur le tapis, en dissociant lombaires et bassin.»
5. **Rotation lombaire** — «Laissez tomber les genoux d'un côté puis de l'autre pour assouplir en rotation les lombaires et les dorsales.»
6. **Piriforme (gauche)** — «Étirez le muscle piriforme du côté gauche. Vous devez sentir l'étirement au milieu de la fesse.»
7. **Piriforme (droit)** — «Étirez le muscle piriforme du côté droit. Gardez une respiration lente et régulière.»
8. **Carré des lombes (gauche)** — «Assis à côté des talons, inclinez le buste vers la gauche pour étirer le carré des lombes.»
9. **Carré des lombes (droit)** — «Inclinez maintenant le buste vers la droite pour étirer le carré des lombes de l'autre côté.»
10. **Prière** — «Reculez les fesses vers les talons et tendez les mains loin devant, comme une prière, pour étirer tout le dos.»
11. **Dos de chat** — «À quatre pattes, alternez extension complète à l'expiration et flexion complète à l'inspiration, sans plier les coudes.»
12. **Gainage alterné** — «À quatre pattes, tendez un bras et la jambe opposée, tenez quelques secondes, puis changez de côté.»
13. **Extension vertébrale** — «Sur le ventre, montez en extension du dos et faites de petits mouvements de balancier pour assouplir.»
14. **Plan postérieur** — «Renforcez le plan postérieur en maintenant la position, avec de petits mouvements des membres pour solliciter les muscles.»
15. **Psoas iliaque (gauche)** — «En fente, amenez la hanche gauche en extension complète pour étirer le psoas; vous sentez une légère tension au pli de l'aine.»
16. **Psoas iliaque (droit)** — «Changez de côté et amenez la hanche droite en extension complète pour étirer le psoas.»
17. **Face antérieure** — «Étirez toute la face avant du corps, abdominaux et pectoraux, avec une extension du dos, en tenant la position.»
18. **Accroupi** — «Accroupissez-vous complètement pour un étirement axial de la colonne; tenez la position pour relâcher le dos.»

## Voice generation pipeline (`scripts/generate-voice.ts`, new)

A one-off Node/Bun script, run manually by the author:

- **Input:** the 18 instruction strings + slugs (sourced from a small exported list so the
  script and the workout definition don't duplicate the text — single source of truth).
- **API:** ElevenLabs TTS, model `eleven_multilingual_v2`, a **calm French male** pre-made
  voice. The concrete `voice_id` is selected during implementation by querying
  `GET /v1/voices` (documented via Context7 before writing the call); it is stored as a
  constant in the script.
- **Output:** `src/lib/assets/voice/back-pain/NN-slug.mp3` (mono, mp3).
- **Idempotent:** skip a slug whose mp3 already exists unless `--force` is passed.
- **Auth:** the API key is read from the `ELEVENLABS_API_KEY` environment variable.

### Security

- **The API key is NEVER written to any committed file** — env var only, passed at run time.
- The generated **mp3s are committed** (that is the requested "stored in repo").
- The key shared in chat should be **rotated** by the user, since chat logs persist it.

## Testing

- Update `src/lib/workout.test.ts` for the parameterized signatures (pass `steps`).
- Add a well-formedness test for `backPainWorkout`: every non-`Rest` step has a `voice`;
  every `Rest` step has no `voice`; rests only appear between exercises.
- The generation script is not unit-tested (network/side-effects); verified by running it.
- `bun run lint` (eslint + svelte-check) and `bun run test` must pass.

## Files touched

- `src/lib/workout.ts` — parameterize transitions; add `voice?`/`Workout` types; remove the
  module-global sequence.
- `src/lib/workouts.ts` (new) — `sevenMinuteWorkout`, `backPainWorkout`, `WORKOUTS`.
- `src/lib/WorkoutPicker.svelte` (new) — workout selection cards.
- `src/routes/+page.svelte` — picker state, pass `steps`, back control, dynamic title.
- `src/lib/sounds.ts` — `playVoice(url)`.
- `src/lib/assets/voice/back-pain/*.mp3` (new, generated) — 18 clips.
- `scripts/generate-voice.ts` (new) + instruction/slug source list.
- `src/lib/workout.test.ts` — updated + new well-formedness test.
- `CLAUDE.md` — note the second workout, voice pipeline, and env-var key convention.

## Open questions

None outstanding — durations, bilateral split, voice style, and structure are decided above.
Durations remain trivially tweakable data if you want to adjust after hearing the routine.
