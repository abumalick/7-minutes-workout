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

// Announce the movement name, then the explanation. Parentheses are stripped so
// "Piriforme (gauche)" is spoken as "Piriforme gauche".
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
    headers: {
      "xi-api-key": KEY,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
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
