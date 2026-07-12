import { existsSync, mkdirSync } from 'node:fs'

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Set OPENAI_API_KEY')
  process.exit(1)
}
const MODEL = 'gpt-image-1'
const force = process.argv.includes('--force')
// Any non-flag args filter which slugs to (re)generate, e.g. `03-pont-fessier`.
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const outDir = 'src/lib/assets/images/back-pain'
mkdirSync(outDir, { recursive: true })

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
  `exercise diagram; modest and non-suggestive. Square 1:1, ${view}.`

type Pose = { slug: string; accent: string; view: string; pose: string }

const poses: Pose[] = [
  {
    slug: '01-flexion-hanche',
    accent: 'the left hip and lower back',
    view: 'side profile',
    pose: 'lying on back in profile; the left knee pulled toward the chest with both hands around the shin, the right leg extended flat on the floor.',
  },
  {
    slug: '01b-flexion-hanche-droit',
    accent: 'the right hip and lower back',
    view: 'side profile',
    pose: 'lying on back in profile; the right knee pulled toward the chest with both hands around the shin, the left leg extended flat on the floor.',
  },
  {
    slug: '02-double-flexion-hanche',
    accent: 'the lower back',
    view: 'side profile',
    pose: 'lying on back in profile; both knees pulled to the chest, hands clasped around the shins, head resting down.',
  },
  {
    slug: '03-pont-fessier',
    accent: 'the glutes and hips',
    view: 'side profile',
    pose: 'lying on back in profile; knees bent, feet flat, hips lifted into a bridge forming a straight diagonal from knees to shoulders, arms flat alongside.',
  },
  {
    slug: '04-lordose-cyphose',
    accent: 'the lower back and lumbar spine',
    view: 'side profile',
    pose: 'lying on back in profile; knees bent, feet flat, hips down, arms alongside, pressing the lower back gently into the floor (pelvic tilt).',
  },
  {
    slug: '05-rotation',
    accent: 'the lower back and obliques',
    view: 'seen from a high 3/4 angle',
    pose: 'lying on back; knees bent and dropped together to one side in a spinal twist, shoulders staying flat on the floor, arms out in a T.',
  },
  {
    slug: '06-piriforme-gauche',
    accent: 'the left gluteal region',
    view: 'side profile',
    pose: 'lying on the back, head down; the right thigh raised toward the chest with the right knee bent and the right foot lifted off the floor; the left ankle crossed and resting on top of the right thigh just above the knee, the bent left knee splayed open out to the side so the two legs clearly form the shape of a number 4; both hands reaching around behind the right thigh to draw it toward the chest.',
  },
  {
    slug: '07-piriforme-droit',
    accent: 'the right gluteal region',
    view: 'side profile',
    pose: 'lying on the back, head down; the left thigh raised toward the chest with the left knee bent and the left foot lifted off the floor; the right ankle crossed and resting on top of the left thigh just above the knee, the bent right knee splayed open out to the side so the two legs clearly form the shape of a number 4; both hands reaching around behind the left thigh to draw it toward the chest.',
  },
  {
    slug: '08-carre-lombes-gauche',
    accent: 'the left side of the trunk (flank)',
    view: 'front view',
    pose: 'kneeling / side-sitting on the floor; torso leaning to the right with the left arm reaching up and over the head in a long lateral curve, lengthening the left flank.',
  },
  {
    slug: '09-carre-lombes-droit',
    accent: 'the right side of the trunk (flank)',
    view: 'front view',
    pose: 'kneeling / side-sitting on the floor; torso leaning to the left with the right arm reaching up and over the head in a long lateral curve, lengthening the right flank.',
  },
  {
    slug: '10-priere',
    accent: 'the whole spine and lower back',
    view: 'side profile',
    pose: "child's pose — kneeling with hips sitting back toward the heels, torso folded forward, both arms stretched far forward flat on the floor, head down.",
  },
  {
    slug: '11-dos-de-chat',
    accent: 'the rounded spine (mid and lower back)',
    view: 'side profile',
    pose: 'on all fours (quadruped), spine rounded upward into a "cat" arch, head tucked.',
  },
  {
    slug: '12-gainage-alterne',
    accent: 'the lower back and core',
    view: 'side profile',
    pose: 'on all fours in a bird-dog — one arm extended straight forward and the opposite leg extended straight back, forming one horizontal line, torso level.',
  },
  {
    slug: '13-extension-vertebrale',
    accent: 'the lower back',
    view: 'side profile',
    pose: 'lying face down (prone), chest and head lifted in a gentle back extension propped on the forearms, hips staying on the floor.',
  },
  {
    slug: '14-plan-posterieur',
    accent: 'the whole back of the body (back, gluteal region, and hamstrings)',
    view: 'side profile',
    pose: 'lying face down (prone), arms extended forward past the head and legs lifted off the floor in a shallow arc (superman).',
  },
  {
    slug: '15-psoas-gauche',
    accent: 'the front of the left hip',
    view: 'side profile',
    pose: 'half-kneeling lunge — left knee down on the floor, right foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.',
  },
  {
    slug: '16-psoas-droit',
    accent: 'the front of the right hip',
    view: 'side profile',
    pose: 'half-kneeling lunge — right knee down on the floor, left foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.',
  },
  {
    slug: '17-anterieure',
    accent: 'the front of the torso — abdominals and chest',
    view: 'side profile',
    pose: 'kneeling upright and arching the back, reaching the arms and hands back toward the heels (camel-like), opening the whole front of the body.',
  },
  {
    slug: '18-accroupi',
    accent: 'the lower back and spine',
    view: 'slight 3/4 front angle',
    pose: 'deep full squat — heels flat on the floor, hips low, torso upright between the knees, arms reaching forward for balance.',
  },
]

// Output-stage moderation is stochastic and occasionally false-flags floor/stretch
// poses, so retry a few times before giving up on an image.
const ATTEMPTS = 3

const generate = async (prompt: string): Promise<Buffer> => {
  let lastErr = ''
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        n: 1,
        size: '1024x1024',
        background: 'transparent',
        output_format: 'png',
        quality: 'medium',
      }),
    })
    if (res.ok) {
      const json = (await res.json()) as { data: { b64_json: string }[] }
      return Buffer.from(json.data[0].b64_json, 'base64')
    }
    lastErr = `${res.status} ${await res.text()}`
    console.warn(`  attempt ${attempt}/${ATTEMPTS} failed: ${lastErr}`)
  }
  throw new Error(lastErr)
}

const failed: string[] = []
for (const { slug, accent, view, pose } of poses) {
  if (only.length && !only.includes(slug)) continue
  const out = `${outDir}/${slug}.png`
  if (existsSync(out) && !force) {
    console.log('skip', slug)
    continue
  }
  const prompt = `${style(accent, view)} Pose: ${pose}`
  try {
    await Bun.write(out, await generate(prompt))
    console.log('wrote', out)
  } catch {
    console.error('FAIL', slug)
    failed.push(slug)
  }
}
if (failed.length) {
  console.error(`\n${failed.length} failed: ${failed.join(', ')}`)
  process.exit(1)
}
console.log('done')
