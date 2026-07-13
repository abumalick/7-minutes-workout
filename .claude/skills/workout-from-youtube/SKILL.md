---
name: workout-from-youtube
description: Use when the user gives a YouTube URL of a follow-along exercise/mobility routine and wants it added to this app as a new workout — extracts the exercises, registers the workout, generates spoken voice cues (ElevenLabs) and pictogram images (gpt-image-1), and publishes a review gallery. Triggers on "add a workout from this video", "make a workout from <youtube url>", "turn this routine into a workout".
---

# Add a workout from a YouTube routine

Reproduces the pipeline that built the `back-pain` workout. Pick a short kebab `id`
(e.g. `neck-mobility`); it maps to `src/lib/<id>-instructions.ts` and the asset dirs
`src/lib/assets/{voice,images}/<id>/`. The picker lists everything in `WORKOUTS`
automatically — no routing work.

## Prerequisites

- Tools: `yt-dlp`, `ffmpeg`, ImageMagick (`magick`), Bitwarden CLI (`bw`, unlocked).
- Keys (NEVER commit): OpenAI = `bw get notes "OPENAI API KEY" | tr -d '[:space:]'`;
  ElevenLabs from its Bitwarden item. Voice defaults to premade male
  `ELEVENLABS_VOICE_ID=onwK4e9ZLuTAKqWW03F9` (the multilingual model covers most languages).

## Data contract (`src/lib/exercise.ts`)

`ExerciseInstruction = { slug, label, duration, text, image?: { accent, view, pose } }`.
Scripts and the registry load a workout by `id` via `import.meta.glob` (assets) and a
dynamic `import("../src/lib/<id>-instructions.ts")` (scripts).

## Steps

1. **Extract** (scratch in `.tmp/`, gitignored):
   - `yt-dlp --print "%(chapters)j" <url>` → chapter list + timestamps (maps ~1:1 to exercises).
   - `yt-dlp --print title --print duration_string --print description <url>` for metadata.
   - Spoken text: `yt-dlp --skip-download --write-auto-subs --sub-langs "<lang>" --sub-format vtt --js-runtimes bun <url>`,
     then parse the `.vtt` (regex on `HH:MM:SS.mmm -->`, dedup) for what the coach says per chapter.
   - ⚠️ Chapter gaps are NOT hold times — choose deliberate durations (~30s; longer for holds).

2. **Author `src/lib/<id>-instructions.ts`** — `export const instructions: ExerciseInstruction[]`
   (type from `./exercise`). Zero-padded kebab `slug`; SPLIT bilateral moves into left/right
   entries (`06-x-gauche` / `07-x-droit`); `label`/`text` in the video's language, side in parens
   (`"Piriforme (gauche)"`). Leave `image` off for now. Add `src/lib/<id>-instructions.test.ts`
   mirroring `back-pain-instructions.test.ts` (unique slugs, positive durations, non-empty text —
   drop the `image` assertions until poses are authored in step 6).

3. **🛑 CHECKPOINT** — show the user a table (#, label, duration, text) and get confirmation
   BEFORE any paid API call. Fix per feedback.

4. **Register** in `src/lib/workouts.ts`: import the new `instructions`, add
   `export const <id>Workout = buildWorkout("<id>", "<Display Name>", instructions);`, and append
   it to `WORKOUTS`. Note: `buildWorkout` throws if a slug has no matching asset, so run the
   voice + image generation (steps 5–6) before relying on `pnpm test`/`build`.

5. **Voice** — `ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=onwK4e9ZLuTAKqWW03F9 node scripts/generate-voice.ts <id>`
   (skip-unless-`--force`). Verify one file: `file src/lib/assets/voice/<id>/01-*.mp3` (should say MPEG audio).

6. **Pose reference → images**:
   - Download ≤720p: `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" -o .tmp/<id>.mp4 <url>`.
   - One mid-hold frame per exercise: `ffmpeg -ss <t> -i .tmp/<id>.mp4 -frames:v 1 .tmp/ref-<slug>.png`
     (blank any face-cam PiP with `-vf "drawbox=x:y:w:h:color=gray:t=fill"`).
   - `magick montage .tmp/ref-*.png -tile 4x -geometry +4+4 .tmp/sheet.png`, then Read it to author
     each entry's `image: { accent, view, pose }` (accent = the muscle highlighted blue; pose =
     detailed anatomy). Add the `image` fields to `<id>-instructions.ts` (and its `image` test assertions).
   - Validate ONE first: `OPENAI_API_KEY="$(bw get notes 'OPENAI API KEY'|tr -d '[:space:]')" node scripts/generate-images.ts <id> <first-slug>`;
     preview `magick <png> -background '#f3f4f6' -flatten .tmp/prev.png` and Read it.
   - Then all: `OPENAI_API_KEY=... node scripts/generate-images.ts <id>`.

7. **Gallery** — `node scripts/build-gallery.ts <id>`, then publish `.tmp/gallery-<id>.html` with
   the Artifact tool (favicon e.g. 🧘) so the user can review every exercise with its image.

8. **Iterate** on wrong poses: edit that entry's `image.pose` and
   `node scripts/generate-images.ts <id> --force <slug>`; for a pure left/right mirror error use
   `magick src/lib/assets/images/<id>/<slug>.png -flop $_` (in place, no regen). Re-verify against
   the video frames, then rebuild + republish the gallery.

9. **Verify + commit** — `pnpm test && pnpm run lint && pnpm run build`; commit
   `src/lib/<id>-instructions.ts`, its test, `workouts.ts`, and the `voice/<id>` + `images/<id>`
   assets. Leave `pnpm run deploy` to the user; remind them to hard-refresh (Ctrl/Cmd+Shift+R).

## Gotchas

- ElevenLabs French _library_ voices need a paid plan → premade male `onwK4e9ZLuTAKqWW03F9`.
- `gpt-image-1` output moderation stochastically false-flags floor/stretch poses → the script
  retries 3×; the "clinical/modest/non-suggestive" style framing (baked into `generate-images.ts`)
  also helps. Keep it.
- Figure-4 / piriforme poses: state that the arms wrap BEHIND the thigh, never on top.
- Verify a corrected image against the actual video frames, not the cached page.
- Generated `.mp3`/`.png` are committed; `.tmp/` and API keys are not.
