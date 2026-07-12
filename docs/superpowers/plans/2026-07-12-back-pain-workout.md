# Back-Pain Workout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second, selectable back-pain mobility workout whose exercises play a concise spoken French instruction (pre-generated ElevenLabs mp3s, committed) when they start.

**Architecture:** Parameterize the pure transition logic in `workout.ts` to take a `steps[]` argument, move workout *data* into a new `workouts.ts` registry, add a picker screen in the single `/` route, and play a per-step `voice` mp3 on the `start` cue. Voiceovers are generated once by a manual `scripts/generate-voice.ts` and stored under `src/lib/assets/voice/back-pain/`.

**Tech Stack:** SvelteKit, Svelte 5 runes, Vite (`import.meta.glob`), Vitest/jsdom, Tailwind v4, Bun, ElevenLabs TTS (`eleven_multilingual_v2`).

## Global Constraints

- Package manager: **bun** (`bun run test`, `bun run lint`).
- Prettier style: single quotes, no semicolons, space indent. `$props()` prop types inlined as object annotation (no separate `type`/`interface`). No comments where code is explicit.
- `WorkoutState`/`Cue`/`Transition` types stay unchanged. `"Rest"` remains the magic rest label.
- ElevenLabs API key comes from `ELEVENLABS_API_KEY` env var and is **never written to a committed file**. Generated mp3s **are** committed.
- Voice: calm French male, model `eleven_multilingual_v2`. Concrete `voice_id` chosen at run time via `GET /v1/voices`, stored as a constant in the script.

---

### Task 1: Parameterize the workout logic and move data to a registry

Behavior-preserving refactor: the 7-minute workout keeps working identically; the pure functions now take `steps`.

**Files:**
- Modify: `src/lib/workout.ts`
- Create: `src/lib/workouts.ts`
- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/workout.test.ts`

**Interfaces:**
- Produces: `WorkoutStep = { label: string; duration: number; voice?: string }`; `Workout = { id: string; name: string; steps: WorkoutStep[] }`; `tick/start/next/prev(steps: WorkoutStep[], s: WorkoutState): Transition`; `isRest(step)`. From `workouts.ts`: `sevenMinuteWorkout: Workout`, `WORKOUTS: Workout[]`.

- [ ] **Step 1: Update the tests to the parameterized signature (failing)**

Replace the top of `src/lib/workout.test.ts` imports and add a bound fixture. Change every call `tick(x)` → `tick(S, x)`, `start(x)` → `start(S, x)`, `next(x)` → `next(S, x)`, `prev(x)` → `prev(S, x)`; change the `sequence` block to use `S`:

```ts
import { describe, expect, it } from 'vitest'
import { isRest, next, prev, start, tick, type WorkoutState } from './workout'
import { sevenMinuteWorkout } from './workouts'

const S = sevenMinuteWorkout.steps

const at = (
  currentIndex: number,
  timeLeft: number,
  isRunning = true,
): WorkoutState => ({ currentIndex, timeLeft, isRunning })

describe('sequence', () => {
  it('has 25 steps starting with a non-Rest exercise and 10s Rests', () => {
    expect(S).toHaveLength(25)
    expect(isRest(S[0])).toBe(false)
    expect(isRest(S[1])).toBe(true)
    expect(isRest(S[24])).toBe(false)
  })
})
```

Then in the `tick`/`start`/`next`/`prev` describe blocks, prefix the sequence arg, e.g. `tick(at(0, 30))` → `tick(S, at(0, 30))` (apply to all calls in the file).

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/lib/workout.test.ts`
Expected: FAIL (compile error: `tick` expects 2 args / `sevenMinuteWorkout` not found).

- [ ] **Step 3: Parameterize `src/lib/workout.ts`**

Replace the file with:

```ts
export type WorkoutStep = { label: string; duration: number; voice?: string }
export type Workout = { id: string; name: string; steps: WorkoutStep[] }
export type WorkoutState = {
  currentIndex: number
  timeLeft: number
  isRunning: boolean
}
export type Cue = 'start' | 'tick' | 'success'
export type Transition = { state: WorkoutState; cues: Cue[] }

const REST = 'Rest'

export const isRest = (step: { label: string }): boolean => step.label === REST

const advance = (steps: WorkoutStep[], i: number): number =>
  (i + 1) % steps.length
const retreat = (steps: WorkoutStep[], i: number): number =>
  (i - 1 + steps.length) % steps.length

const stepCues = (
  steps: WorkoutStep[],
  fromIndex: number,
  toIndex: number,
  leavingActive: boolean,
): Cue[] => {
  const cues: Cue[] = []
  if (leavingActive && !isRest(steps[fromIndex])) cues.push('success')
  if (!isRest(steps[toIndex])) cues.push('start')
  return cues
}

export function tick(steps: WorkoutStep[], s: WorkoutState): Transition {
  if (s.timeLeft > 0) {
    const cues: Cue[] = s.timeLeft <= 5 ? ['tick'] : []
    return { state: { ...s, timeLeft: s.timeLeft - 1 }, cues }
  }
  const toIndex = advance(steps, s.currentIndex)
  const completed = s.currentIndex === steps.length - 1
  return {
    state: {
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
      isRunning: completed ? false : s.isRunning,
    },
    cues: stepCues(steps, s.currentIndex, toIndex, true),
  }
}

export function start(steps: WorkoutStep[], s: WorkoutState): Transition {
  const atStepStart = s.timeLeft === steps[s.currentIndex].duration
  const cues: Cue[] =
    !isRest(steps[s.currentIndex]) && atStepStart ? ['start'] : []
  return { state: { ...s, isRunning: true }, cues }
}

function skip(
  steps: WorkoutStep[],
  s: WorkoutState,
  toIndex: number,
): Transition {
  return {
    state: {
      ...s,
      currentIndex: toIndex,
      timeLeft: steps[toIndex].duration,
    },
    cues: stepCues(steps, s.currentIndex, toIndex, s.timeLeft > 0),
  }
}

export function next(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, advance(steps, s.currentIndex))
}

export function prev(steps: WorkoutStep[], s: WorkoutState): Transition {
  return skip(steps, s, retreat(steps, s.currentIndex))
}
```

- [ ] **Step 4: Create `src/lib/workouts.ts` with the 7-minute data**

```ts
import type { Workout } from './workout'

export const sevenMinuteWorkout: Workout = {
  id: 'seven-minute',
  name: '7 Minute Workout',
  steps: [
    { label: 'Jumping Jacks', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Wall Sit', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Push-ups', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Abdominal Crunch', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Step-up onto Chair', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Squats', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Triceps Dip on Chair', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Plank', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'High Knees Running in Place', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Lunges', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Push-up and Rotation', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Side Plank (Left)', duration: 30 },
    { label: 'Rest', duration: 10 },
    { label: 'Side Plank (Right)', duration: 30 },
  ],
}

export const WORKOUTS: Workout[] = [sevenMinuteWorkout]
```

- [ ] **Step 5: Update `src/routes/+page.svelte` to drive from a workout's steps**

Change the script block to use `sevenMinuteWorkout.steps` and pass `steps` into every transition call (no picker yet):

```svelte
<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import { play } from '$lib/sounds'
  import { isRest, next, prev, start, tick, type Transition } from '$lib/workout'
  import { sevenMinuteWorkout } from '$lib/workouts'

  const steps = sevenMinuteWorkout.steps

  let currentIndex = $state(0)
  let timeLeft = $state(steps[0].duration)
  let isRunning = $state(false)

  const currentWorkout = $derived(steps[currentIndex])
  const nextWorkoutLabel = $derived(steps[(currentIndex + 1) % steps.length].label)

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    for (const cue of cues) play(cue)
  }

  $effect(() => {
    if (!isRunning) return
    const id = setInterval(
      () => apply(tick(steps, { currentIndex, timeLeft, isRunning })),
      1000,
    )
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10">
    <h1 class="text-4xl font-bold text-center">{sevenMinuteWorkout.name}</h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    <WorkoutPanel
      currentWorkoutLabel={currentWorkout.label}
      {timeLeft}
      {isRunning}
      nextWorkoutLabel={isRest(currentWorkout) ? nextWorkoutLabel : undefined}
      onStart={() => apply(start(steps, { currentIndex, timeLeft, isRunning }))}
      onPause={() => (isRunning = false)}
      onNext={() => apply(next(steps, { currentIndex, timeLeft, isRunning }))}
      onPrevious={() => apply(prev(steps, { currentIndex, timeLeft, isRunning }))}
    />
  </main>
</div>
```

- [ ] **Step 6: Run tests and lint**

Run: `bun run test -- src/lib/workout.test.ts` → Expected: PASS.
Run: `bun run lint` → Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/workout.ts src/lib/workouts.ts src/routes/+page.svelte src/lib/workout.test.ts
git commit -m "refactor: parameterize workout logic and add workout registry"
```

---

### Task 2: Workout picker screen

**Files:**
- Create: `src/lib/WorkoutPicker.svelte`
- Modify: `src/routes/+page.svelte`

**Interfaces:**
- Consumes: `WORKOUTS`, `Workout` from Task 1.
- `WorkoutPicker` props: `{ workouts: Workout[]; onSelect: (id: string) => void }`.

- [ ] **Step 1: Create `src/lib/WorkoutPicker.svelte`**

```svelte
<script lang="ts">
  import type { Workout } from './workout'

  let { workouts, onSelect }: {
    workouts: Workout[]
    onSelect: (id: string) => void
  } = $props()
</script>

<div class="flex flex-col items-center gap-4 p-8 w-full max-w-sm">
  <h2 class="text-2xl font-bold mb-2">Choose a workout</h2>
  {#each workouts as workout (workout.id)}
    <button
      type="button"
      onclick={() => onSelect(workout.id)}
      class="w-full py-6 px-4 bg-white rounded-2xl shadow text-xl font-bold hover:bg-blue-50"
    >
      {workout.name}
    </button>
  {/each}
</div>
```

- [ ] **Step 2: Wire picker state into `src/routes/+page.svelte`**

Replace the script + markup so a `null` selection shows the picker. Keep the transition wiring from Task 1, but source `steps` from the selected workout:

```svelte
<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import WorkoutPicker from '$lib/WorkoutPicker.svelte'
  import { play } from '$lib/sounds'
  import { isRest, next, prev, start, tick, type Transition } from '$lib/workout'
  import { WORKOUTS } from '$lib/workouts'

  let selectedId = $state<string | null>(null)
  const selected = $derived(WORKOUTS.find((w) => w.id === selectedId) ?? null)

  let currentIndex = $state(0)
  let timeLeft = $state(0)
  let isRunning = $state(false)

  function selectWorkout(id: string) {
    selectedId = id
    const steps = WORKOUTS.find((w) => w.id === id)!.steps
    currentIndex = 0
    timeLeft = steps[0].duration
    isRunning = false
  }

  function backToPicker() {
    isRunning = false
    selectedId = null
  }

  const currentStep = $derived(selected ? selected.steps[currentIndex] : null)
  const nextLabel = $derived(
    selected
      ? selected.steps[(currentIndex + 1) % selected.steps.length].label
      : '',
  )

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    for (const cue of cues) play(cue)
  }

  $effect(() => {
    if (!isRunning || !selected) return
    const steps = selected.steps
    const id = setInterval(
      () => apply(tick(steps, { currentIndex, timeLeft, isRunning })),
      1000,
    )
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10 flex items-center justify-center">
    {#if selected}
      <button
        type="button"
        onclick={backToPicker}
        class="absolute left-4 text-blue-600 font-bold"
        aria-label="Back to workouts"
      >
        ← Retour
      </button>
    {/if}
    <h1 class="text-3xl font-bold text-center">
      {selected ? selected.name : 'Workouts'}
    </h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    {#if selected && currentStep}
      <WorkoutPanel
        currentWorkoutLabel={currentStep.label}
        {timeLeft}
        {isRunning}
        nextWorkoutLabel={isRest(currentStep) ? nextLabel : undefined}
        onStart={() => apply(start(selected.steps, { currentIndex, timeLeft, isRunning }))}
        onPause={() => (isRunning = false)}
        onNext={() => apply(next(selected.steps, { currentIndex, timeLeft, isRunning }))}
        onPrevious={() => apply(prev(selected.steps, { currentIndex, timeLeft, isRunning }))}
      />
    {:else}
      <WorkoutPicker workouts={WORKOUTS} onSelect={selectWorkout} />
    {/if}
  </main>
</div>
```

- [ ] **Step 3: Verify by running the app**

Run: `bun run dev` and open the app. Expected: picker shows "7 Minute Workout"; selecting it runs the timer as before; "← Retour" returns to the picker. Run `bun run lint` → no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/WorkoutPicker.svelte src/routes/+page.svelte
git commit -m "feat: add workout picker screen"
```

---

### Task 3: Back-pain instruction source and voice generation

**Files:**
- Create: `src/lib/back-pain-instructions.ts`
- Create: `scripts/generate-voice.ts`
- Create (generated): `src/lib/assets/voice/back-pain/*.mp3`
- Create: `src/lib/back-pain-instructions.test.ts`

**Interfaces:**
- Produces: `backPainInstructions: { slug: string; label: string; duration: number; text: string }[]` (18 entries, in order).

- [ ] **Step 1: Write the failing test for the instruction source**

`src/lib/back-pain-instructions.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { backPainInstructions } from './back-pain-instructions'

describe('backPainInstructions', () => {
  it('has 18 exercises with unique slugs, positive durations, and text', () => {
    expect(backPainInstructions).toHaveLength(18)
    const slugs = backPainInstructions.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(18)
    for (const e of backPainInstructions) {
      expect(e.duration).toBeGreaterThan(0)
      expect(e.label.length).toBeGreaterThan(0)
      expect(e.text.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test -- src/lib/back-pain-instructions.test.ts`
Expected: FAIL (`backPainInstructions` not found).

- [ ] **Step 3: Create `src/lib/back-pain-instructions.ts`**

```ts
export type ExerciseInstruction = {
  slug: string
  label: string
  duration: number
  text: string
}

export const backPainInstructions: ExerciseInstruction[] = [
  { slug: '01-flexion-hanche', label: 'Flexion de hanche', duration: 30, text: 'Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.' },
  { slug: '02-double-flexion-hanche', label: 'Double flexion de hanche', duration: 30, text: 'Ramenez les deux genoux vers la poitrine et ajoutez de petites rotations pour détendre la région lombaire.' },
  { slug: '03-pont-fessier', label: 'Pont fessier', duration: 30, text: 'Levez les fesses pour renforcer les fessiers, puis redéroulez la colonne vertèbre par vertèbre, du haut vers le bas.' },
  { slug: '04-lordose-cyphose', label: 'Lordose – cyphose', duration: 30, text: "À l'inspiration, cambrez le dos ; à l'expiration, plaquez le bas du dos sur le tapis, en dissociant lombaires et bassin." },
  { slug: '05-rotation', label: 'Rotation lombaire', duration: 30, text: "Laissez tomber les genoux d'un côté puis de l'autre pour assouplir en rotation les lombaires et les dorsales." },
  { slug: '06-piriforme-gauche', label: 'Piriforme (gauche)', duration: 30, text: "Étirez le muscle piriforme du côté gauche. Vous devez sentir l'étirement au milieu de la fesse." },
  { slug: '07-piriforme-droit', label: 'Piriforme (droit)', duration: 30, text: 'Étirez le muscle piriforme du côté droit. Gardez une respiration lente et régulière.' },
  { slug: '08-carre-lombes-gauche', label: 'Carré des lombes (gauche)', duration: 30, text: 'Assis à côté des talons, inclinez le buste vers la gauche pour étirer le carré des lombes.' },
  { slug: '09-carre-lombes-droit', label: 'Carré des lombes (droit)', duration: 30, text: 'Inclinez maintenant le buste vers la droite pour étirer le carré des lombes de l’autre côté.' },
  { slug: '10-priere', label: 'Prière', duration: 30, text: 'Reculez les fesses vers les talons et tendez les mains loin devant, comme une prière, pour étirer tout le dos.' },
  { slug: '11-dos-de-chat', label: 'Dos de chat', duration: 30, text: "À quatre pattes, alternez extension complète à l'expiration et flexion complète à l'inspiration, sans plier les coudes." },
  { slug: '12-gainage-alterne', label: 'Gainage alterné', duration: 30, text: 'À quatre pattes, tendez un bras et la jambe opposée, tenez quelques secondes, puis changez de côté.' },
  { slug: '13-extension-vertebrale', label: 'Extension vertébrale', duration: 30, text: 'Sur le ventre, montez en extension du dos et faites de petits mouvements de balancier pour assouplir.' },
  { slug: '14-plan-posterieur', label: 'Plan postérieur', duration: 40, text: 'Renforcez le plan postérieur en maintenant la position, avec de petits mouvements des membres pour solliciter les muscles.' },
  { slug: '15-psoas-gauche', label: 'Psoas iliaque (gauche)', duration: 30, text: "En fente, amenez la hanche gauche en extension complète pour étirer le psoas ; vous sentez une légère tension au pli de l'aine." },
  { slug: '16-psoas-droit', label: 'Psoas iliaque (droit)', duration: 30, text: 'Changez de côté et amenez la hanche droite en extension complète pour étirer le psoas.' },
  { slug: '17-anterieure', label: 'Face antérieure', duration: 30, text: 'Étirez toute la face avant du corps, abdominaux et pectoraux, avec une extension du dos, en tenant la position.' },
  { slug: '18-accroupi', label: 'Accroupi', duration: 60, text: 'Accroupissez-vous complètement pour un étirement axial de la colonne ; tenez la position pour relâcher le dos.' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- src/lib/back-pain-instructions.test.ts`
Expected: PASS.

- [ ] **Step 5: Create `scripts/generate-voice.ts`**

```ts
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
```

- [ ] **Step 6: Choose a French voice and generate the audio**

First list voices to pick a calm French male `voice_id` (verify the endpoint shape via Context7 for "ElevenLabs API" if unsure):

Run: `curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices | grep -iE 'name|voice_id|language|french' | head`

Then generate:

Run: `ELEVENLABS_VOICE_ID=<chosen-id> bun scripts/generate-voice.ts`
Expected: 18 lines "wrote src/lib/assets/voice/back-pain/NN-slug.mp3" then "done". Spot-check one clip plays and is French.

- [ ] **Step 7: Commit**

```bash
git add src/lib/back-pain-instructions.ts src/lib/back-pain-instructions.test.ts scripts/generate-voice.ts src/lib/assets/voice/back-pain
git commit -m "feat: add back-pain instruction text and generate French voiceovers"
```

---

### Task 4: Wire the back-pain workout and voice playback

**Files:**
- Modify: `src/lib/workouts.ts`
- Modify: `src/lib/sounds.ts`
- Modify: `src/routes/+page.svelte`
- Create: `src/lib/workouts.test.ts`

**Interfaces:**
- Consumes: `backPainInstructions` (Task 3), `WorkoutStep`/`Workout` (Task 1), the generated mp3s.
- Produces: `backPainWorkout: Workout` and updated `WORKOUTS = [sevenMinuteWorkout, backPainWorkout]`; `playVoice(url: string): void` from `sounds.ts`.

- [ ] **Step 1: Write the failing well-formedness test**

`src/lib/workouts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isRest } from './workout'
import { backPainWorkout } from './workouts'

describe('backPainWorkout', () => {
  const steps = backPainWorkout.steps

  it('gives every exercise a voice and no rest a voice', () => {
    for (const step of steps) {
      if (isRest(step)) expect(step.voice).toBeUndefined()
      else expect(typeof step.voice).toBe('string')
    }
  })

  it('starts and ends on an exercise with 10s rests only between exercises', () => {
    expect(isRest(steps[0])).toBe(false)
    expect(isRest(steps[steps.length - 1])).toBe(false)
    steps.forEach((step, i) => {
      if (isRest(step)) {
        expect(step.duration).toBe(10)
        expect(isRest(steps[i - 1])).toBe(false)
        expect(isRest(steps[i + 1])).toBe(false)
      }
    })
  })

  it('has 18 exercises', () => {
    expect(steps.filter((s) => !isRest(s))).toHaveLength(18)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `bun run test -- src/lib/workouts.test.ts`
Expected: FAIL (`backPainWorkout` not exported).

- [ ] **Step 3: Add `backPainWorkout` to `src/lib/workouts.ts`**

Append (and update the `WORKOUTS` export):

```ts
import { backPainInstructions } from './back-pain-instructions'

const voiceUrls = import.meta.glob('./assets/voice/back-pain/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const voiceFor = (slug: string): string => {
  const entry = Object.entries(voiceUrls).find(([path]) =>
    path.endsWith(`/${slug}.mp3`),
  )
  if (!entry) throw new Error(`Missing voice audio for ${slug}`)
  return entry[1]
}

const exerciseSteps: WorkoutStep[] = backPainInstructions.map((ex) => ({
  label: ex.label,
  duration: ex.duration,
  voice: voiceFor(ex.slug),
}))

export const backPainWorkout: Workout = {
  id: 'back-pain',
  name: 'Routine mal de dos',
  steps: exerciseSteps.flatMap((step, i) =>
    i === 0 ? [step] : [{ label: 'Rest', duration: 10 }, step],
  ),
}
```

Change the top import to also import `WorkoutStep`, and change the registry line:

```ts
import type { Workout, WorkoutStep } from './workout'
```
```ts
export const WORKOUTS: Workout[] = [sevenMinuteWorkout, backPainWorkout]
```

- [ ] **Step 4: Add `playVoice` to `src/lib/sounds.ts`**

Append:

```ts
let currentVoice: HTMLAudioElement | null = null

export function playVoice(url: string): void {
  if (!browser) return
  if (currentVoice) {
    currentVoice.pause()
    currentVoice.currentTime = 0
  }
  currentVoice = new Audio(url)
  currentVoice
    .play()
    .catch((error) => console.error('Error playing voice:', error))
}
```

- [ ] **Step 5: Play the voice on the `start` cue in `src/routes/+page.svelte`**

Update the import and `apply()`:

```svelte
  import { play, playVoice } from '$lib/sounds'
```
```svelte
  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    const step = selected?.steps[currentIndex]
    for (const cue of cues) {
      if (cue === 'start' && step?.voice) playVoice(step.voice)
      else play(cue)
    }
  }
```

- [ ] **Step 6: Run tests, lint, and verify in the app**

Run: `bun run test` → Expected: PASS (all suites).
Run: `bun run lint` → Expected: no errors.
Run: `bun run dev`, pick "Routine mal de dos", press Start. Expected: first instruction is spoken in French; advancing to the next exercise speaks its instruction; rests are silent; last-5s ticks still play.

- [ ] **Step 7: Commit**

```bash
git add src/lib/workouts.ts src/lib/sounds.ts src/routes/+page.svelte src/lib/workouts.test.ts
git commit -m "feat: add back-pain workout with spoken French instructions"
```

---

### Task 5: Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update `CLAUDE.md` architecture notes**

Add, in the Architecture section: workouts now live in `src/lib/workouts.ts` (`WORKOUTS` registry: `sevenMinuteWorkout`, `backPainWorkout`); `workout.ts` transitions take `steps` as their first argument; `+page.svelte` shows a `WorkoutPicker` until a workout is chosen. Add a "Voice instructions" note: `backPainWorkout` steps carry a `voice` mp3 played via `playVoice` on the `start` cue; clips live in `src/lib/assets/voice/back-pain/` and are generated by `scripts/generate-voice.ts` (reads `backPainInstructions`, needs `ELEVENLABS_API_KEY` + `ELEVENLABS_VOICE_ID` env vars; the API key is never committed).

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document workout registry and voice pipeline"
```

---

## Self-Review

**Spec coverage:** 2nd workout + picker (Tasks 1–2, 4) ✓; French voice (Task 3) ✓; concise instructions (Task 3) ✓; L/R split for piriforme/QL/psoas (Task 3, 18 entries) ✓; parameterized logic + `workouts.ts` (Task 1) ✓; per-step voice on `start` cue + `playVoice` (Task 4) ✓; generation script, env-var key, committed mp3s (Task 3) ✓; well-formedness test (Task 4) ✓; docs (Task 5) ✓.

**Placeholder scan:** `<chosen-id>` in Task 3 Step 6 is an intentional runtime value (the voice_id is picked from the live API), not a code placeholder — every code block is complete.

**Type consistency:** `WorkoutStep`/`Workout` defined in Task 1 and consumed identically in `workouts.ts`; `tick/start/next/prev(steps, state)` signatures match across `+page.svelte` and tests; `backPainInstructions` shape matches between the source, its test, and `voiceFor`/`exerciseSteps`; `playVoice(url)` defined in Task 4 Step 4 and called in Step 5.
