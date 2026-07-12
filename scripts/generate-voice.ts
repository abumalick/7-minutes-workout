import { existsSync, mkdirSync } from 'node:fs'
import { backPainInstructions } from '../src/lib/back-pain-instructions'

const KEY = process.env.ELEVENLABS_API_KEY
if (!KEY) {
  console.error('Set ELEVENLABS_API_KEY')
  process.exit(1)
}
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID
if (!VOICE_ID) {
  console.error('Set ELEVENLABS_VOICE_ID (a calm French male voice)')
  process.exit(1)
}
const MODEL = 'eleven_multilingual_v2'
const force = process.argv.includes('--force')
const outDir = 'src/lib/assets/voice/back-pain'
mkdirSync(outDir, { recursive: true })

for (const { slug, text } of backPainInstructions) {
  const out = `${outDir}/${slug}.mp3`
  if (existsSync(out) && !force) {
    console.log('skip', slug)
    continue
  }
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': KEY,
        'content-type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  )
  if (!res.ok) {
    console.error('FAIL', slug, res.status, await res.text())
    process.exit(1)
  }
  await Bun.write(out, await res.arrayBuffer())
  console.log('wrote', out)
}
console.log('done')
