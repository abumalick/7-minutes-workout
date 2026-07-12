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
