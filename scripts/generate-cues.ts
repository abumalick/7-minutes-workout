import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";

// Shared, workout-agnostic French instructor cues: the "go" said when an exercise
// starts and the spoken countdown numbers. Run: node scripts/generate-cues.ts [--force]
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Set ELEVENLABS_API_KEY");
  process.exit(1);
}
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "onwK4e9ZLuTAKqWW03F9";
const MODEL = "eleven_multilingual_v2";
const force = process.argv.includes("--force");

const CUES: Record<string, string> = {
  go: "C'est parti !",
  "5": "Cinq.",
  "4": "Quatre.",
  "3": "Trois.",
  "2": "Deux.",
  "1": "Un.",
};

const outDir = "src/lib/assets/voice/cues/fr";
mkdirSync(outDir, { recursive: true });

for (const [name, text] of Object.entries(CUES)) {
  const out = `${outDir}/${name}.mp3`;
  if (existsSync(out) && !force) {
    console.log("skip", name);
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": KEY,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    console.error("FAIL", name, res.status, await res.text());
    process.exit(1);
  }
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", out);
}
console.log("done");
