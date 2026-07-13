# Instruction-on-rest + spoken French instructor cues

Date: 2026-07-13

## Goal

Change the workout flow so the spoken instruction for an exercise plays **during the
rest that precedes it** (a preview + prep window), instead of at the moment the exercise
starts. Add spoken French "instructor" audio: a spoken **"C'est parti !"** when an
exercise begins and a spoken **"cinq, quatre, trois, deux, un"** countdown in its last
five seconds, plus a shorter **"trois, deux, un"** "get ready" countdown in the last
seconds of each rest. Keep a replay control available in **both** the rest and the
exercise. Also translate the 7-minute workout's copy to French so the whole app is French.

## Non-goals

- No English cue set. All spoken cues are French; the single French cue set applies to
  every workout, including the "7 Minute Workout".
- No spoken "stop" at the exercise end (chosen: the existing success chime marks the end,
  so the following rest instruction plays without an audio collision).
- No per-exercise **spoken instructions** for the 7-minute workout — it has none, so its
  rests carry no `voice` (only labels are translated; see design §7).

## Current behaviour (baseline)

- `buildWorkout` (`src/lib/workouts.ts`) interleaves 10s `Rest` steps between exercises.
  Exercise steps carry `voice`/`image`; rest steps carry nothing.
- `workout.ts` pure transitions emit `Cue`s (`"start" | "tick" | "success"`). The view
  (`+page.svelte` `apply`) plays them: on `start` it plays the step's `voice` if present,
  else the `start` beep; `tick` beeps in the last 5s; `success` chimes on finishing an
  exercise.
- The replay button (`Controls.svelte`) already renders whenever the current step has a
  `voice` — today that means during exercises only.

## Design

### 1. Data model

`buildWorkout` gives each **rest step the upcoming exercise's `voice`**:
`{ label: "Rest", duration: 10, voice: nextExercise.voice }`. Exercise steps keep their
own `voice` (unchanged). Consequences that fall out for free:

- The rest auto-speaks the upcoming instruction.
- The replay button auto-appears during the rest (it keys off "step has a `voice`").
- The exercise keeps its own replay.

Add a shared French cue set, attached to every workout:

```ts
type WorkoutCues = { go: string; countdown: Record<number, string> }; // urls; countdown keyed 1..5
type Workout = { id; name; steps; cues?: WorkoutCues };
```

Loaded once at module load by globbing `src/lib/assets/voice/cues/fr/*.mp3`
(`go.mp3`, `1.mp3`..`5.mp3`). `buildWorkout` sets `cues` on the workouts it builds, and
`sevenMinuteWorkout` gets the same `cues` object explicitly.

### 2. Pure logic (`workout.ts`)

Add `"instruct"` to the `Cue` union: `"start" | "tick" | "success" | "instruct"`.

Cue semantics:

- `instruct` — speak the current step's instruction (`step.voice`): the rest's upcoming
  voice on auto-advance into a rest, or the exercise's own voice on manual skip / first
  Start.
- `start` — "go": an exercise is beginning after its rest preview.
- `tick` — last-5s countdown pulse (the spoken number is derived in the view).
- `success` — an exercise completed (chime). Unchanged.

Transition rules:

- **`tick`** — countdown branch unchanged: `timeLeft <= 5 ? ["tick"] : []`, decrement.
  On advance (`timeLeft === 0`) to `toIndex`, with `from = steps[currentIndex]`,
  `to = steps[toIndex]`, `completed = currentIndex === steps.length - 1`:
  - if `!isRest(from)` push `success` (leaving an exercise);
  - if `completed` → stop (`isRunning: false`), cues are `["success"]` only (no go/instruct
    for a finished workout);
  - else if `isRest(to)` push `instruct`, else push `start`.
- **`start`** (Start button): `atStepStart = timeLeft === step.duration`.
  `cues = atStepStart ? ["instruct"] : []`. Speaks the current step's instruction on the
  first exercise (which has no preceding rest); a mid-step resume stays silent.
- **`next` / `prev`** (`skip`): `toIndex` is always an exercise (rests are skipped). Cues:
  `if (timeLeft > 0 && !isRest(from)) push "success"` (preserve today's leaving-active
  chime), then push `instruct` (speak the landed exercise's instruction, since its rest
  preview was skipped).

All rules are pure and unit-tested — no DOM, no audio.

### 3. View mapping (`+page.svelte` `apply`)

For each cue, using the selected workout's `cues` and the landed `step`:

- `instruct` → `step.voice ? playVoice(step.voice) : play("start")` (beep fallback covers a
  step with no instruction).
- `start` → `cues?.go ? playVoice(cues.go) : play("start")`.
- `tick` → the spoken number is `cues.countdown[timeLeft + 1]` (`timeLeft + 1` is the
  number the user just saw, 5..1 — worth a comment):
  - during an **exercise** with `cues`: play it for the full last 5s (5..1, "stop"
    countdown);
  - during a **rest** with `cues`: play it only for the last **3s** (3..1, "get ready"
    countdown) so it lands _after_ the rest's spoken instruction, never on top of it;
  - with no `cues`: `play("tick")` (beep), unchanged.
- `success` → `play("success")` (chime), unchanged.

The `success` chime uses the `play()` channel and the `instruct` uses `playVoice()`; they
are independent audio elements, so the exercise→rest `["success", "instruct"]` pair does
not clip.

### 4. Controls / components

No prop changes. `Controls.svelte`'s replay button already keys off `onReplay`, which
`+page.svelte` wires whenever `currentStep.voice` exists — now true during rests too. The
"Up next: …" label and next-exercise image preview during rest (already present) pair with
the spoken preview.

### 5. Asset generation

New `scripts/generate-cues.ts`: same ElevenLabs voice/model as `generate-voice.ts`
(`eleven_multilingual_v2`, `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID`). Generates into
`src/lib/assets/voice/cues/fr/`, skipping existing unless `--force`:

| file   | text            |
| ------ | --------------- |
| go.mp3 | "C'est parti !" |
| 5.mp3  | "cinq"          |
| 4.mp3  | "quatre"        |
| 3.mp3  | "trois"         |
| 2.mp3  | "deux"          |
| 1.mp3  | "un"            |

Clips are committed like the other mp3s.

### 6. 7-minute workout localization

Translate `sevenMinuteWorkout`'s `name` and exercise `label`s to French (data-only edit in
`src/lib/workouts.ts`), e.g. `"7 Minute Workout"` → `"Entraînement 7 minutes"`,
`"Jumping Jacks"` → `"Jumping jacks"`, `"Wall Sit"` → `"Chaise contre le mur"`,
`"Push-ups"` → `"Pompes"`, `"Squats"` → `"Squats"`, `"Plank"` → `"Planche"`,
`"Lunges"` → `"Fentes"`, etc. The `"Rest"` step label is a **magic string** (`isRest`
compares `label === "Rest"`) and is left as-is — it is not user-facing copy to translate
here (and back-pain workouts already display it); changing it is out of scope. The 7-minute
workout gains no per-exercise `voice`; only its labels change.

### 7. Testing

- `workout.test.ts`: assert `instruct` on auto-advance into a rest, `start` on auto-advance
  into an exercise, `instruct` on `next`/`prev`, `instruct` on first Start, `["success"]`
  only on completing the final exercise, and the unchanged `tick` countdown.
- `workouts.test.ts`: assert each built rest step's `voice` equals the following exercise's
  `voice`, and that every workout in `WORKOUTS` carries a `cues` set whose `go` and
  `countdown[1..5]` resolve.

## Resolved decisions

1. Translate the 7-minute workout's name and exercise labels to French (§6). `"Rest"` stays
   as the magic label.
2. Add a spoken "get ready" countdown in the rest's last 3s (§3), after the instruction.
