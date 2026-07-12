# workout-from-youtube Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a project-local Claude Code skill that turns a YouTube routine URL into a new in-app workout (extract → register → voice + images → review gallery → commit), by generalizing the back-pain generation machinery to be workout-`id`-parameterized.

**Architecture:** Generalize `workouts.ts` (asset globs + `buildWorkout`), the two generation scripts, and add a gallery builder — all keyed by a workout `id` that maps to `src/lib/<id>-instructions.ts`. A `SKILL.md` playbook orchestrates the pipeline with baked-in gotchas. Back-pain is migrated to the generic shape behavior-preservingly.

**Tech Stack:** SvelteKit + Svelte 5, Vite `import.meta.glob`, TypeScript (strict), Vitest, Node 24 (native TS strip) for scripts, ElevenLabs TTS, OpenAI `gpt-image-1`, `yt-dlp`/`ffmpeg`/ImageMagick for extraction.

## Global Constraints

- Package manager **pnpm**; scripts run with `node scripts/<x>.ts` (Node 24 strips TS). No Bun globals in script code.
- Format/lint via **vite-plus** (`vp`), double quotes + semicolons. Pre-commit hook runs `vp staged` + `svelte-check` + tests — keep them green.
- TypeScript strict; `$lib` aliases `src/lib`.
- Slugs are the asset join key: zero-padded kebab, L/R split for bilateral moves.
- Generated `.mp3`/`.png` are committed; `.tmp/` is gitignored; API keys are NEVER committed.
- Asset layout: `src/lib/assets/voice/<id>/<slug>.mp3`, `src/lib/assets/images/<id>/<slug>.png`.
- Image style is load-bearing: two-tone slate `#334155` body / blue `#2563eb` accent, "clinical/modest/non-suggestive", transparent 1024² PNG, 3× retry.

---

### Task 1: Shared `ExerciseInstruction` type + migrate back-pain data

**Files:**

- Create: `src/lib/exercise.ts`
- Modify: `src/lib/back-pain-instructions.ts` (rename export `backPainInstructions`→`instructions`, import shared type, fold in `image` fields)
- Modify: `src/lib/back-pain-instructions.test.ts` (import `instructions`; assert `image` well-formedness)

**Interfaces:**

- Produces: `type ExerciseInstruction = { slug: string; label: string; duration: number; text: string; image?: { accent: string; view: string; pose: string } }` from `src/lib/exercise.ts`; `export const instructions: ExerciseInstruction[]` from `back-pain-instructions.ts`.

- [ ] **Step 1: Create the shared type**

`src/lib/exercise.ts`:

```ts
export type ExerciseInstruction = {
  slug: string;
  label: string;
  duration: number;
  text: string;
  image?: { accent: string; view: string; pose: string };
};
```

- [ ] **Step 2: Update the failing test first**

In `src/lib/back-pain-instructions.test.ts`, change the import to `import { instructions } from "./back-pain-instructions";`, replace `backPainInstructions` with `instructions`, and add an assertion that every entry has a complete `image`:

```ts
for (const e of instructions) {
  expect(e.duration).toBeGreaterThan(0);
  expect(e.label.length).toBeGreaterThan(0);
  expect(e.text.length).toBeGreaterThan(0);
  expect(e.image?.accent.length).toBeGreaterThan(0);
  expect(e.image?.view.length).toBeGreaterThan(0);
  expect(e.image?.pose.length).toBeGreaterThan(0);
}
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm test src/lib/back-pain-instructions.test.ts`
Expected: FAIL — `instructions` not exported / `image` undefined.

- [ ] **Step 4: Migrate the data**

In `back-pain-instructions.ts`: replace the local `ExerciseInstruction` type block with `import type { ExerciseInstruction } from "./exercise";`, rename `export const backPainInstructions` → `export const instructions`, and add an `image` field to each entry copied 1:1 from the `poses` array currently in `scripts/generate-images.ts` (match by `slug`). Mapping rule: pose entry `{ slug, accent, view, pose }` → that instruction's `image: { accent, view, pose }`. Example:

```ts
{
  slug: "06-piriforme-gauche",
  label: "Piriforme (gauche)",
  duration: 30,
  text: "Étirez le muscle piriforme du côté gauche. Vous devez sentir l'étirement au milieu de la fesse.",
  image: {
    accent: "the left gluteal region",
    view: "side profile",
    pose: "lying on the back, head down; the right thigh raised toward the chest with the right knee bent and the right foot off the floor; the left ankle crossed on top of the right thigh just above the knee, the bent left knee splayed open to the side so the two legs form the shape of a number 4; the left arm threaded through the gap between the two legs and the right arm passing around the outside, both hands clasping together behind the right thigh (gripping the back of the thigh) to pull it toward the chest — the arms wrap around the BACK of the thigh and must never rest on top of the leg.",
  },
},
```

Do this for all 19 entries (poses `01-flexion-hanche` … `18-accroupi`, including `01b`).

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm test src/lib/back-pain-instructions.test.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/lib/exercise.ts src/lib/back-pain-instructions.ts src/lib/back-pain-instructions.test.ts
git commit -m "refactor: shared ExerciseInstruction type + fold image poses into back-pain data"
```

---

### Task 2: Generalize the workout registry

**Files:**

- Modify: `src/lib/workouts.ts`
- Modify: `src/lib/workouts.test.ts` (add `buildWorkout` + `assetFor` unit tests)

**Interfaces:**

- Consumes: `instructions` from `back-pain-instructions.ts`; `ExerciseInstruction` from `exercise.ts`.
- Produces: `buildWorkout(id: string, name: string, instructions: ExerciseInstruction[]): Workout`; unchanged `backPainWorkout`, `WORKOUTS`.

- [ ] **Step 1: Write the failing test**

Append to `src/lib/workouts.test.ts`:

```ts
import { buildWorkout } from "./workouts";

describe("buildWorkout", () => {
  it("interleaves a 10s Rest before every exercise except the first", () => {
    const w = buildWorkout("back-pain", "X", [
      { slug: "06-piriforme-gauche", label: "A", duration: 30, text: "" },
      { slug: "07-piriforme-droit", label: "B", duration: 30, text: "" },
    ]);
    expect(w.steps.map((s) => s.label)).toEqual(["A", "Rest", "B"]);
    expect(w.steps[1].duration).toBe(10);
    expect(typeof w.steps[0].voice).toBe("string");
    expect(typeof w.steps[0].image).toBe("string");
  });

  it("throws on a slug with no matching asset", () => {
    expect(() =>
      buildWorkout("back-pain", "X", [{ slug: "nope", label: "A", duration: 30, text: "" }]),
    ).toThrow();
  });
});
```

(The slugs above use real back-pain assets so the lookup resolves.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/workouts.test.ts`
Expected: FAIL — `buildWorkout` not exported.

- [ ] **Step 3: Rewrite `workouts.ts`**

```ts
import type { Workout, WorkoutStep } from "./workout";
import type { ExerciseInstruction } from "./exercise";
import { instructions as backPainInstructions } from "./back-pain-instructions";

export const sevenMinuteWorkout: Workout = {
  id: "seven-minute",
  name: "7 Minute Workout",
  steps: [
    { label: "Jumping Jacks", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Wall Sit", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Push-ups", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Abdominal Crunch", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Step-up onto Chair", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Squats", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Triceps Dip on Chair", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Plank", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "High Knees Running in Place", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Lunges", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Push-up and Rotation", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Side Plank (Left)", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Side Plank (Right)", duration: 30 },
  ],
};

const voiceUrls = import.meta.glob("./assets/voice/**/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const imageUrls = import.meta.glob("./assets/images/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const assetFor = (urls: Record<string, string>, id: string, slug: string, ext: string): string => {
  const entry = Object.entries(urls).find(([path]) => path.endsWith(`/${id}/${slug}.${ext}`));
  if (!entry) throw new Error(`Missing ${ext} asset for ${id}/${slug}`);
  return entry[1];
};

export const buildWorkout = (
  id: string,
  name: string,
  instructions: ExerciseInstruction[],
): Workout => {
  const exercises: WorkoutStep[] = instructions.map((ex) => ({
    label: ex.label,
    duration: ex.duration,
    voice: assetFor(voiceUrls, id, ex.slug, "mp3"),
    image: assetFor(imageUrls, id, ex.slug, "png"),
  }));
  return {
    id,
    name,
    steps: exercises.flatMap((step, i) =>
      i === 0 ? [step] : [{ label: "Rest", duration: 10 }, step],
    ),
  };
};

export const backPainWorkout = buildWorkout(
  "back-pain",
  "Routine mal de dos",
  backPainInstructions,
);

export const WORKOUTS: Workout[] = [sevenMinuteWorkout, backPainWorkout];
```

- [ ] **Step 4: Run the full suite**

Run: `pnpm test`
Expected: PASS — existing `backPainWorkout` tests (19 exercises, rests, voice, image) plus the new `buildWorkout` tests all green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/workouts.ts src/lib/workouts.test.ts
git commit -m "refactor: id-parameterized workout registry (buildWorkout + ** asset globs)"
```

---

### Task 3: Generalize the voice generator

**Files:**

- Modify: `scripts/generate-voice.ts`

**Interfaces:**

- Consumes: `instructions` from `src/lib/<id>-instructions.ts` (dynamic import); `ExerciseInstruction` from `exercise.ts`.
- Produces: CLI `node scripts/generate-voice.ts <id> [--force]` writing `src/lib/assets/voice/<id>/<slug>.mp3`.

- [ ] **Step 1: Rewrite the script**

```ts
import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { ExerciseInstruction } from "../src/lib/exercise.ts";

const id = process.argv[2];
if (!id || id.startsWith("--")) {
  console.error("Usage: node scripts/generate-voice.ts <workout-id> [--force] [slug...]");
  process.exit(1);
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Set ELEVENLABS_API_KEY");
  process.exit(1);
}
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "onwK4e9ZLuTAKqWW03F9";
const MODEL = "eleven_multilingual_v2";
const force = process.argv.includes("--force");
const only = process.argv.slice(3).filter((a) => !a.startsWith("--"));

const { instructions } = (await import(`../src/lib/${id}-instructions.ts`)) as {
  instructions: ExerciseInstruction[];
};

const outDir = `src/lib/assets/voice/${id}`;
mkdirSync(outDir, { recursive: true });

const spokenName = (label: string): string =>
  label.replace(/[()]/g, "").replace(/\s+/g, " ").trim();

for (const { slug, label, text } of instructions) {
  if (only.length && !only.includes(slug)) continue;
  const out = `${outDir}/${slug}.mp3`;
  if (existsSync(out) && !force) {
    console.log("skip", slug);
    continue;
  }
  const spoken = `${spokenName(label)}. ${text}`;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text: spoken,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    console.error("FAIL", slug, res.status, await res.text());
    process.exit(1);
  }
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", out);
}
console.log("done");
```

- [ ] **Step 2: Verify the generic path resolves without spending**

Run: `node scripts/generate-voice.ts back-pain`
Expected: prints `skip 01-flexion-hanche` … `skip 18-accroupi` then `done` (no API call — all 19 mp3s already exist). This proves the id arg + dynamic import + per-id outDir work.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-voice.ts
git commit -m "refactor: id-parameterized generate-voice (dynamic instructions import)"
```

---

### Task 4: Generalize the image generator

**Files:**

- Modify: `scripts/generate-images.ts`

**Interfaces:**

- Consumes: `instructions[].image` from `src/lib/<id>-instructions.ts`.
- Produces: CLI `node scripts/generate-images.ts <id> [--force] [slug...]` writing `src/lib/assets/images/<id>/<slug>.png`.

- [ ] **Step 1: Rewrite the script**

Keep `style()`, `ATTEMPTS`, and `generate()` verbatim from the current file. Replace the `Pose`/`poses` block and the write loop with an id-driven version, and swap `Bun.write` for `node:fs` `writeFile`:

```ts
import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { ExerciseInstruction } from "../src/lib/exercise.ts";

const id = process.argv[2];
if (!id || id.startsWith("--")) {
  console.error("Usage: node scripts/generate-images.ts <workout-id> [--force] [slug...]");
  process.exit(1);
}
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("Set OPENAI_API_KEY");
  process.exit(1);
}
const MODEL = "gpt-image-1";
const force = process.argv.includes("--force");
const only = process.argv.slice(3).filter((a) => !a.startsWith("--"));

const { instructions } = (await import(`../src/lib/${id}-instructions.ts`)) as {
  instructions: ExerciseInstruction[];
};
const poses = instructions.filter((e) => e.image);

const outDir = `src/lib/assets/images/${id}`;
mkdirSync(outDir, { recursive: true });

// --- style(), ATTEMPTS, generate() unchanged from prior version ---

const failed: string[] = [];
for (const ex of poses) {
  if (only.length && !only.includes(ex.slug)) continue;
  const out = `${outDir}/${ex.slug}.png`;
  if (existsSync(out) && !force) {
    console.log("skip", ex.slug);
    continue;
  }
  const { accent, view, pose } = ex.image!;
  const prompt = `${style(accent, view)} Pose: ${pose}`;
  try {
    await writeFile(out, await generate(prompt));
    console.log("wrote", out);
  } catch {
    console.error("FAIL", ex.slug);
    failed.push(ex.slug);
  }
}
if (failed.length) {
  console.error(`\n${failed.length} failed: ${failed.join(", ")}`);
  process.exit(1);
}
console.log("done");
```

Note: `generate()` returns a `Buffer` — keep it as-is; `writeFile(out, buffer)` accepts it.

- [ ] **Step 2: Verify the generic path resolves without spending**

Run: `OPENAI_API_KEY=x node scripts/generate-images.ts back-pain`
Expected: prints `skip 01-flexion-hanche` … `skip 18-accroupi` then `done` (all 19 PNGs exist → no API call, dummy key never used).

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-images.ts
git commit -m "refactor: id-parameterized generate-images (poses from instruction data)"
```

---

### Task 5: Gallery builder

**Files:**

- Create: `scripts/build-gallery.ts`

**Interfaces:**

- Consumes: `instructions` from `src/lib/<id>-instructions.ts`; PNGs under `src/lib/assets/images/<id>/`.
- Produces: CLI `node scripts/build-gallery.ts <id>` writing `.tmp/gallery-<id>.html` (Artifact-ready body content: inline `<style>` + a `<figure>` grid, no `<!doctype>`/`<html>`/`<head>`).

- [ ] **Step 1: Write the script**

```ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { ExerciseInstruction } from "../src/lib/exercise.ts";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/build-gallery.ts <workout-id>");
  process.exit(1);
}
const { instructions } = (await import(`../src/lib/${id}-instructions.ts`)) as {
  instructions: ExerciseInstruction[];
};
const imgDir = `src/lib/assets/images/${id}`;

const cards = instructions
  .map((ex, i) => {
    const p = `${imgDir}/${ex.slug}.png`;
    const img = existsSync(p)
      ? `<img alt="${ex.label}" src="data:image/png;base64,${readFileSync(p).toString("base64")}">`
      : `<div class="missing">missing</div>`;
    const accent = ex.image ? ` — <span class="accent">${ex.image.accent}</span>` : "";
    return `<figure><div class="frame">${img}</div><figcaption><b>${i + 1}.</b> ${ex.label}${accent}</figcaption></figure>`;
  })
  .join("\n");

const html = `<style>
  .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding: 16px; font-family: system-ui, sans-serif; }
  .gallery figure { margin: 0; border-radius: 12px; overflow: hidden; background: #f3f4f6; }
  .gallery .frame { aspect-ratio: 1; display: grid; place-items: center; background: #f3f4f6; }
  .gallery img { width: 100%; height: 100%; object-fit: contain; }
  .gallery figcaption { padding: 8px 10px; font-size: 14px; color: #1f2937; }
  .gallery .accent { color: #2563eb; }
  .gallery .missing { color: #9ca3af; font-size: 13px; }
  @media (prefers-color-scheme: dark) { .gallery figcaption { color: #e5e7eb; } }
  :root[data-theme="dark"] .gallery figcaption { color: #e5e7eb; }
</style>
<div class="gallery">
${cards}
</div>`;

mkdirSync(".tmp", { recursive: true });
const out = `.tmp/gallery-${id}.html`;
writeFileSync(out, html);
console.log("wrote", out);
```

- [ ] **Step 2: Verify against back-pain**

Run: `node scripts/build-gallery.ts back-pain`
Expected: `wrote .tmp/gallery-back-pain.html`. Confirm it exists and is non-trivial: `test -s .tmp/gallery-back-pain.html && grep -c "<figure>" .tmp/gallery-back-pain.html` → `19`.

- [ ] **Step 3: Commit**

```bash
git add scripts/build-gallery.ts
git commit -m "feat: add id-parameterized review-gallery builder"
```

---

### Task 6: The skill (`SKILL.md`)

**Files:**

- Create: `.claude/skills/workout-from-youtube/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/workout-from-youtube/SKILL.md` with YAML frontmatter (`name: workout-from-youtube`, a `description` that triggers on "add/create a workout from a YouTube URL / video") and a body documenting the pipeline below. It MUST include: the exact commands, the id/slug conventions, the CHECKPOINT gate, the reference-frame image workflow, key retrieval, and every gotcha. Content:

```markdown
---
name: workout-from-youtube
description: Use when the user gives a YouTube URL of a follow-along exercise/mobility routine and wants it added to this app as a new workout — extracts the exercises, registers the workout, generates spoken voice cues (ElevenLabs) and pictogram images (gpt-image-1), and publishes a review gallery. Triggers on "add a workout from this video", "make a workout from <youtube url>", "turn this routine into a workout".
---

# Add a workout from a YouTube routine

Reproduces the pipeline that built the `back-pain` workout. Pick a short kebab `id`
(e.g. `neck-mobility`); it maps to `src/lib/<id>-instructions.ts` and the asset dirs
`src/lib/assets/{voice,images}/<id>/`.

## Prerequisites

- Tools: `yt-dlp`, `ffmpeg`, ImageMagick (`magick`), Bitwarden CLI (`bw`, unlocked).
- Keys (NEVER commit): OpenAI = `bw get notes "OPENAI API KEY" | tr -d '[:space:]'`;
  ElevenLabs from its Bitwarden item. Voice defaults to premade male
  `ELEVENLABS_VOICE_ID=onwK4e9ZLuTAKqWW03F9` (multilingual model covers most languages).

## Steps

1. **Extract** (scratch in `.tmp/`, gitignored):
   - `yt-dlp --print "%(chapters)j" <url>` → chapter list + timestamps (maps ~1:1 to exercises).
   - `yt-dlp --print title --print duration_string --print description <url>` for metadata.
   - Spoken text: `yt-dlp --skip-download --write-auto-subs --sub-langs "<lang>" --sub-format vtt --js-runtimes bun <url>`, parse the `.vtt` (regex on `HH:MM:SS.mmm -->`, dedup) for what the coach says per chapter.
   - ⚠️ Chapter gaps are NOT hold times — choose deliberate durations (~30s; longer for holds).

2. **Author `src/lib/<id>-instructions.ts`** — `export const instructions: ExerciseInstruction[]`
   (type from `src/lib/exercise.ts`). Zero-padded kebab `slug`; SPLIT bilateral moves into
   left/right entries; `label`/`text` in the video's language, side in parens
   (`"Piriforme (gauche)"`). Leave `image` off for now. Add `src/lib/<id>-instructions.test.ts`
   mirroring `back-pain-instructions.test.ts` (unique slugs, positive durations, non-empty text).

3. **🛑 CHECKPOINT** — show the user a table (#, label, duration, text) and get confirmation
   BEFORE any paid API call. Fix per feedback.

4. **Register** in `src/lib/workouts.ts`: import the new `instructions`, add
   `export const <id>Workout = buildWorkout("<id>", "<Display Name>", instructions);`, and
   append it to `WORKOUTS`. `pnpm test` — the new workout's asset lookups will THROW until
   assets exist, so run voice+images first, or temporarily expect that.

5. **Voice** — `ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=onwK4e9ZLuTAKqWW03F9 node scripts/generate-voice.ts <id>`
   (skip-unless-`--force`). Verify a file with `file src/lib/assets/voice/<id>/01-*.mp3`.

6. **Pose reference → images**:
   - Download ≤720p: `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" -o .tmp/<id>.mp4 <url>`.
   - One mid-hold frame per exercise: `ffmpeg -ss <t> -i .tmp/<id>.mp4 -frames:v 1 .tmp/ref-<slug>.png` (blank any face-cam PiP with `-vf "drawbox=...:t=fill"`).
   - `magick montage .tmp/ref-*.png -tile 4x -geometry +4+4 .tmp/sheet.png` and Read it to author each entry's `image: { accent, view, pose }` (accent = muscle highlighted blue; pose = detailed anatomy). Add the `image` fields to `<id>-instructions.ts`.
   - Validate ONE first: `OPENAI_API_KEY="$(bw get notes 'OPENAI API KEY'|tr -d '[:space:]')" node scripts/generate-images.ts <id> <first-slug>`; preview `magick <png> -background '#f3f4f6' -flatten .tmp/prev.png` and Read it.
   - Then all: `OPENAI_API_KEY=... node scripts/generate-images.ts <id>`.

7. **Gallery** — `node scripts/build-gallery.ts <id>` → publish `.tmp/gallery-<id>.html` with the
   Artifact tool (favicon e.g. 🧘) for the user to review.

8. **Iterate** on wrong poses: edit that entry's `image.pose` and
   `node scripts/generate-images.ts <id> --force <slug>`; for a pure left/right mirror error use
   `magick src/lib/assets/images/<id>/<slug>.png -flop <same>` (no regen). Re-verify against the
   video frames; rebuild + republish the gallery.

9. **Verify + commit** — `pnpm test && pnpm run lint && pnpm run build`; commit
   `src/lib/<id>-instructions.ts`, the test, `workouts.ts`, and the `voice/<id>` + `images/<id>`
   assets. Leave `pnpm run deploy` to the user; remind them to hard-refresh (Ctrl/Cmd+Shift+R).

## Gotchas

- ElevenLabs French _library_ voices need a paid plan → premade male `onwK4e9ZLuTAKqWW03F9`.
- `gpt-image-1` output moderation stochastically false-flags floor/stretch poses → the script
  retries 3×; the "clinical/modest/non-suggestive" style framing also helps. Keep it.
- Figure-4 / piriforme poses: state that arms wrap BEHIND the thigh, never on top.
- Verify a corrected image against the actual video frames, not the cached page.
```

- [ ] **Step 2: Sanity-check frontmatter + placement**

Run: `test -f .claude/skills/workout-from-youtube/SKILL.md && head -4 .claude/skills/workout-from-youtube/SKILL.md`
Expected: shows the YAML frontmatter with `name: workout-from-youtube`.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/workout-from-youtube/SKILL.md
git commit -m "feat: add workout-from-youtube skill playbook"
```

---

### Task 7: Full verification

- [ ] **Step 1: Run the whole gate**

Run: `pnpm test && pnpm run lint && pnpm run build`
Expected: all tests pass, lint clean, static build succeeds (back-pain workout unchanged, assets resolve).

- [ ] **Step 2: Update `CLAUDE.md`**

Add a one-line note under the relevant section that `generate-voice.ts` / `generate-images.ts` / `build-gallery.ts` now take a `<workout-id>` arg and that the `workout-from-youtube` skill orchestrates adding new workouts.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: note id-parameterized scripts + workout-from-youtube skill"
```

## Self-Review

- **Spec coverage:** data contract → Task 1; registry generalization → Task 2; generate-voice → Task 3; generate-images → Task 4; gallery → Task 5; SKILL.md pipeline + gotchas → Task 6; testing/verify → Tasks 2–7. All spec sections mapped.
- **Placeholder scan:** back-pain `image` folding in Task 1 references the concrete source (`generate-images.ts` `poses`) with an explicit 1:1 mapping rule + a full worked example — the data already exists, not invented.
- **Type consistency:** `ExerciseInstruction` (with optional `image`), `instructions`, `buildWorkout(id,name,instructions)`, `assetFor(urls,id,slug,ext)` used consistently across Tasks 1–6; scripts import the type from `../src/lib/exercise.ts`.
