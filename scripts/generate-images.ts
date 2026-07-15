import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
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
const IMAGE_PX = 512;
const force = process.argv.includes("--force");
// Any non-flag args after the id filter which slugs to (re)generate, e.g. `03-pont-fessier`.
const only = process.argv.slice(3).filter((a) => !a.startsWith("--"));

const { instructions } = (await import(`../src/lib/${id}-instructions.ts`)) as {
  instructions: ExerciseInstruction[];
};
const poses = instructions.filter((e) => e.image);

const outDir = `src/lib/assets/images/${id}`;
mkdirSync(outDir, { recursive: true });

// Two-tone accent silhouette. {ACCENT} = highlighted area, {VIEW} = camera angle.
// The "clinical exercise diagram, modest and non-suggestive" framing keeps the
// clean look while avoiding image-safety false positives on floor/stretch poses.
const style = (accent: string, view: string): string =>
  `Minimalist flat two-tone pictogram of a single gender-neutral figure doing a ` +
  `mobility exercise. Solid dark slate (#334155) body silhouette, clean smooth ` +
  `rounded vector shapes, no face, no anatomical detail. Highlight ${accent} in ` +
  `bright blue (#2563eb) to indicate the target area. Whole body in frame, ` +
  `centered, generous margin, transparent background, no mat, no equipment, no ` +
  `text, no shadows. Clean modern non-realistic icon style, like a clinical ` +
  `exercise diagram; modest and non-suggestive. Square 1:1, ${view}.`;

// Output-stage moderation is stochastic and occasionally false-flags floor/stretch
// poses, so retry a few times before giving up on an image.
const ATTEMPTS = 3;

const generate = async (prompt: string): Promise<Buffer> => {
  let lastErr = "";
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        authorization: `Bearer ${KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        n: 1,
        size: "1024x1024",
        background: "transparent",
        output_format: "png",
        quality: "medium",
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { data: { b64_json: string }[] };
      return Buffer.from(json.data[0].b64_json, "base64");
    }
    lastErr = `${res.status} ${await res.text()}`;
    console.warn(`  attempt ${attempt}/${ATTEMPTS} failed: ${lastErr}`);
  }
  throw new Error(lastErr);
};

// gpt-image-1 returns 1024×1024 RGBA (~1.4MB each) and these ship in the app bundle, but
// the panel only ever renders them ~256px. Halving to 512 still leaves 2× for retina, and
// a palette cuts the rest: flat two-tone pictograms quantize with no visible loss (~12KB).
const optimize = (png: Buffer): Promise<Buffer> =>
  sharp(png)
    .resize(IMAGE_PX, IMAGE_PX, { fit: "inside", withoutEnlargement: true })
    .png({ palette: true, quality: 90, effort: 10 })
    .toBuffer();

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
    await writeFile(out, await optimize(await generate(prompt)));
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
