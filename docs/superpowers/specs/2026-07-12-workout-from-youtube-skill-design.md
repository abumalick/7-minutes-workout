# Design: `workout-from-youtube` skill

**Date:** 2026-07-12
**Status:** Approved (autopilot)

## Goal

A project-local Claude Code skill that, given a YouTube URL of a follow-along
exercise routine, reproduces the pipeline that built the `back-pain` workout:
extract the exercises, add them as a **new workout** in the app, generate spoken
voice cues **and** exercise pictograms, and show the user a review gallery of the
exercises with their generated images. Ends with a git commit of the new data +
assets (deploy left to the user).

Success = running the skill on a new routine URL produces a new selectable
workout in the picker with per-exercise voice + image, a published gallery
Artifact for review, and green tests/lint — with only the exercise-list
confirmation and pose-correction requiring the user.

## Non-goals

- No auto-deploy (user runs `pnpm run deploy`).
- No new routing; the picker already lists everything in `WORKOUTS`.
- Not a general video summarizer — scoped to follow-along mobility/fitness routines.

## Approach

**Generalize the two generation scripts + `workouts.ts` to be workout-`id`-parameterized, and drive them from a `SKILL.md` playbook.**

The current `scripts/generate-voice.ts`, `scripts/generate-images.ts`, and the
`import.meta.glob` in `workouts.ts` are hardcoded to `back-pain`. We parameterize
them by a workout **id** so each future run only authors new data files and calls
the generic scripts. The load-bearing, must-stay-stable artifacts — the image
style preamble, the ElevenLabs/OpenAI API params, the retry logic — live in the
scripts (not re-improvised each run); the process, checkpoints, and hard-won
gotchas live in `SKILL.md`.

Rejected alternatives: a pure playbook (SKILL.md only, adapt scripts each run —
too much per-run drift); a single URL→everything mega-script (brittle, can't
checkpoint, hard to correct poses).

## Data contract

Each workout's exercises live in `src/lib/<id>-instructions.ts`:

```ts
export type ExerciseInstruction = {
  slug: string; // zero-padded kebab, e.g. "06-piriforme-gauche"; L/R split; join key for assets
  label: string; // display name in the video's language; side in parens, e.g. "Piriforme (gauche)"
  duration: number; // deliberate hold time in seconds (NOT the chapter gap)
  text: string; // spoken instruction in the video's language
  image?: {
    // pictogram art-direction (English); consumed by generate-images, ignored by voice
    accent: string; // area highlighted blue (#2563eb)
    view: string; // camera angle, e.g. "side profile"
    pose: string; // detailed anatomical pose description
  };
};

export const instructions: ExerciseInstruction[] = [
  /* ... */
];
```

- **One source of truth per exercise** — voice text and image pose colocated.
- Existing `back-pain-instructions.ts` migrates to this shape: rename
  `backPainInstructions` → `instructions`, and fold the pose array currently
  inlined in `generate-images.ts` into each entry's `image` field. Back-pain
  images already exist (skip-unless-`--force`), so no regeneration risk.

## Components / changes

1. **`src/lib/<id>-instructions.ts`** (new per workout) — the data contract above,
   plus a well-formedness test `src/lib/<id>-instructions.test.ts` (unique slugs,
   positive durations, non-empty text).

2. **`src/lib/workouts.ts`** (generalized) — globs widen to
   `./assets/voice/**/*.mp3` and `./assets/images/**/*.png`; helpers become
   `voiceFor(id, slug)` / `imageFor(id, slug)` matching path suffix
   `/<id>/<slug>.{mp3,png}` (fail-fast if missing). A small `buildWorkout(id, name, instructions)`
   helper maps instructions → steps and interleaves the 10s `"Rest"` step before
   every exercise except the first. `WORKOUTS` gains the new workout.

3. **`scripts/generate-voice.ts`** (generalized) — takes an `<id>` arg, dynamically
   imports `../src/lib/<id>-instructions.ts`, writes to
   `src/lib/assets/voice/<id>/<slug>.mp3`. Unchanged core: ElevenLabs
   `eleven_multilingual_v2`, `stability 0.5 / similarity_boost 0.75`, spoken text
   `"<name>. <instruction>"` (parens stripped), skip-unless-`--force`. Env:
   `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (default the premade male
   `onwK4e9ZLuTAKqWW03F9`; the multilingual model handles non-French — override
   the id per language if desired).

4. **`scripts/generate-images.ts`** (generalized) — takes an `<id>` arg + optional
   slug filter, reads poses from that workout's instruction `image` fields, writes
   to `src/lib/assets/images/<id>/<slug>.png`. Unchanged core: `gpt-image-1`,
   transparent 1024² PNG, the slate `#334155` / blue `#2563eb`
   "clinical/modest/non-suggestive" style preamble + per-pose clause, 3× retry,
   skip-unless-`--force`. Key: `bw get notes "OPENAI API KEY"`.

5. **`scripts/build-gallery.ts`** (new) — takes an `<id>`, reads the instruction
   list + on-disk PNGs, emits a self-contained, theme-aware HTML gallery to
   `.tmp/gallery-<id>.html` (each PNG base64-embedded, composited on `#f3f4f6`,
   card = number + label + accent muscle). The skill publishes it with the
   Artifact tool for review.

6. **`.claude/skills/workout-from-youtube/SKILL.md`** (new) — the orchestration
   playbook (see Pipeline) with the baked-in gotchas.

## Pipeline (what SKILL.md orchestrates)

1. **Extract** — `yt-dlp --print "%(chapters)j"` for exercises + timestamps; fall
   back to auto-subs (`--js-runtimes bun`, video language) for spoken text; capture
   title/author. Scratch in `.tmp/` (already gitignored).
2. **Author `<id>-instructions.ts`** — slugs, L/R splits, deliberate durations,
   video-language `text`/`label`. Add its well-formedness test.
3. **🛑 CHECKPOINT** — show the exercise table (name / duration / text) and get user
   confirmation before any paid API call.
4. **Register** — `buildWorkout` + append to `WORKOUTS`.
5. **Voice** — `node scripts/generate-voice.ts <id>`.
6. **Pose refs → images** — download video ≤720p, `ffmpeg` one mid-hold frame per
   exercise, montage, Read to author each `image` field; validate ONE image, then
   `node scripts/generate-images.ts <id>`.
7. **Gallery** — `node scripts/build-gallery.ts <id>` → publish Artifact.
8. **Iterate** — wrong pose → edit `image.pose` + `--force` regen; pure L/R mirror
   error → `magick <png> -flop` in place; re-verify against frames; redeploy gallery.
9. **Verify + commit** — `pnpm test`, `pnpm run lint`, `pnpm run build`; commit new
   data + assets. Deploy left to user.

## Baked-in gotchas (carried into SKILL.md)

- Chapter gaps are **not** hold times — set deliberate durations.
- ElevenLabs French **library** voices need a paid plan → use premade male
  `onwK4e9ZLuTAKqWW03F9`.
- `gpt-image-1` output moderation stochastically false-flags floor/stretch poses →
  3× retry + "clinical / modest / non-suggestive" framing.
- Figure-4 (piriforme) poses: arms wrap **behind** the thigh, never on top.
- Keys from Bitwarden, **never committed**: OpenAI = `bw get notes "OPENAI API KEY"`.
- Generated mp3s/PNGs are committed; `.tmp/` is not.
- After deploy, hard-refresh (Ctrl/Cmd+Shift+R) to beat stale cache; verify the
  committed asset, not the rendered page.

## Testing

- Unit (pure logic, jsdom-free): generalized `workouts.ts` registry — `voiceFor`/
  `imageFor` id+slug matching and `buildWorkout` rest-interleaving — via
  `workouts.test.ts`; per-workout `<id>-instructions.test.ts` well-formedness.
- Generation scripts + gallery are side-effecting integration; verified by running
  `generate-voice`/`generate-images` on the migrated `back-pain` id (must **skip**
  existing assets — proves the generic id path resolves without spending).
- Skill end-to-end verified when first exercised on a real URL (out of scope for
  the build itself, which only ships the machinery + migrates back-pain).

## Risks

- Dynamic `import()` of a `.ts` file by id under Node 24 type-stripping — verify it
  resolves; fall back to a static id→module registry if not.
- Back-pain migration must be behavior-preserving (same slugs, same assets, tests
  stay green).
