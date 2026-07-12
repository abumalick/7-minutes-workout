# Svelte Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the "7 Minute Workout" timer from React 19 + TanStack Router to SvelteKit, in-place, with behavior identical to today.

**Architecture:** All timer/progression logic lives in a pure, side-effect-free module (`src/lib/workout.ts`) that is unit-tested first. The Svelte page (`src/routes/+page.svelte`) is a thin shell: three `$state` runes, one `$effect`-driven interval, audio playback, and markup. Presentational components (`WorkoutPanel`, `Controls`) receive props. Fully static output via `adapter-static` + prerender.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript (strict), vitest, ESLint 9 (flat) + `eslint-plugin-svelte`, Prettier + `prettier-plugin-svelte`, `svelte-check`, `lucide-svelte`, bun.

## Global Constraints

- Package manager is **bun** (`bun.lock`). Use `bun` / `bunx`, never npm/pnpm/yarn.
- **Behavior must not change.** The `WORKOUT_SEQUENCE`, countdown, auto-advance, stop-after-last-step, and the three audio cues (`start` on entering a non-Rest step, `tick` for the last 5 seconds, `success` on finishing a non-Rest step) must match the current React app exactly.
- `"Rest"` is the magic label distinguishing rest from exercise.
- Code style: single quotes, no semicolons, space indentation (matches the outgoing Biome config).
- TypeScript strict mode stays on.
- Remove React, TanStack, Biome, and all shadcn scaffolding entirely.

---

## File Structure

**Created:**

- `svelte.config.js` — SvelteKit config (adapter-static, vitePreprocess)
- `vite.config.ts` — Vite plugins (tailwind + sveltekit) + vitest config
- `tsconfig.json` — extends generated `.svelte-kit/tsconfig.json` (replaces the React one)
- `eslint.config.js` — ESLint 9 flat config
- `.prettierrc` — Prettier + svelte plugin
- `src/app.html` — SvelteKit HTML shell (replaces `index.html`)
- `src/app.css` — trimmed Tailwind entry (replaces `src/styles.css`)
- `src/routes/+layout.svelte` — imports `app.css`, renders children
- `src/routes/+layout.ts` — `prerender = true`
- `src/routes/+page.svelte` — the app shell
- `src/lib/workout.ts` — pure sequence + transitions (**tested**)
- `src/lib/workout.test.ts` — vitest unit tests (**written first**)
- `src/lib/sounds.ts` — browser-guarded audio cue player
- `src/lib/WorkoutPanel.svelte` — presentational
- `src/lib/Controls.svelte` — presentational
- `static/` — moved from `public/` (favicon.ico, logo192.png, logo512.png, manifest.json, robots.txt)
- `src/lib/assets/sounds/*.mp3` — moved from `src/assets/sounds/`

**Deleted:** `index.html`, `vite.config.js`, `biome.json`, `components.json`, `.cta.json`, `.cursorrules`, `src/main.tsx`, `src/reportWebVitals.ts`, `src/logo.svg`, `src/styles.css`, `src/routeTree.gen.ts`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/-components/`, `src/hooks/`, `src/lib/utils.ts`, `public/`, `src/assets/`.

---

## Task 1: Swap the toolchain — remove React, install SvelteKit, add configs

Get a minimal SvelteKit app booting in this repo. No app logic yet — just a "Hello" page proving the toolchain works.

**Files:**

- Delete: all React/config files listed above
- Create: `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `src/app.html`, `src/app.css`, `src/routes/+layout.svelte`, `src/routes/+layout.ts`, `src/routes/+page.svelte` (placeholder)
- Modify: `package.json` (deps via bun, then scripts)
- Move: `public/` → `static/`, `src/assets/sounds/` → `src/lib/assets/sounds/`

**Interfaces:**

- Produces: `$lib` alias (SvelteKit built-in) → `src/lib`; running `bun run dev` on port 3000; `bun run test` via vitest.

- [ ] **Step 1: Remove React/tooling dependencies**

```bash
bun remove @tanstack/react-router @tanstack/react-router-devtools @tanstack/router-plugin \
  react react-dom class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate \
  @biomejs/biome @testing-library/dom @testing-library/react @types/react @types/react-dom \
  @vitejs/plugin-react web-vitals
```

- [ ] **Step 2: Add SvelteKit + tooling dependencies**

```bash
bun add -d @sveltejs/kit @sveltejs/adapter-static @sveltejs/vite-plugin-svelte svelte svelte-check \
  @eslint/js eslint eslint-plugin-svelte globals typescript-eslint prettier prettier-plugin-svelte \
  lucide-svelte
```

(Kept from before: `@tailwindcss/vite`, `tailwindcss`, `typescript`, `vite`, `vitest`, `jsdom`.)

- [ ] **Step 3: Delete React source and config files**

```bash
git rm -r index.html vite.config.js biome.json components.json .cta.json .cursorrules \
  src/main.tsx src/reportWebVitals.ts src/logo.svg src/styles.css src/routeTree.gen.ts \
  src/routes/__root.tsx src/routes/index.tsx src/routes/-components src/hooks src/lib/utils.ts \
  tsconfig.json
```

- [ ] **Step 4: Move static assets and sound files**

```bash
git mv public static
mkdir -p src/lib/assets
git mv src/assets/sounds src/lib/assets/sounds
rmdir src/assets 2>/dev/null || true
```

- [ ] **Step 5: Write `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
}
```

- [ ] **Step 6: Write `vite.config.ts`**

```ts
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 7: Write `tsconfig.json`**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 8: Write `.prettierrc`**

```json
{
  "useTabs": false,
  "singleQuote": true,
  "semi": false,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

- [ ] **Step 9: Write `eslint.config.js`**

```js
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import ts from 'typescript-eslint'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
  },
)
```

- [ ] **Step 10: Overwrite `.gitignore`**

```
node_modules
.DS_Store
dist
dist-ssr
*.local
.svelte-kit
/build
```

- [ ] **Step 11: Write `src/app.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="%sveltekit.assets%/favicon.ico" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="A simple 7 minutes workout app to help you stay fit and healthy."
    />
    <link rel="apple-touch-icon" href="%sveltekit.assets%/logo192.png" />
    <link rel="manifest" href="%sveltekit.assets%/manifest.json" />
    <title>7 minutes workout</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 12: Write `src/app.css`** (trimmed — dead shadcn tokens removed)

```css
@import 'tailwindcss';

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 13: Write `src/routes/+layout.ts`**

```ts
export const prerender = true
```

- [ ] **Step 14: Write `src/routes/+layout.svelte`**

```svelte
<script lang="ts">
  import '../app.css'

  let { children } = $props()
</script>

{@render children()}
```

- [ ] **Step 15: Write placeholder `src/routes/+page.svelte`**

```svelte
<h1>Hello</h1>
```

- [ ] **Step 16: Replace `package.json` scripts**

Replace the `"scripts"` object with:

```json
  "scripts": {
    "dev": "vite dev --port 3000",
    "start": "vite dev --port 3000",
    "build": "vite build",
    "serve": "vite preview",
    "test": "vitest run",
    "lint": "eslint . && svelte-check --tsconfig ./tsconfig.json",
    "format": "prettier --write ."
  },
```

- [ ] **Step 17: Generate SvelteKit types**

Run: `bunx svelte-kit sync`
Expected: creates `.svelte-kit/` with `tsconfig.json` and `$types`, no errors.

- [ ] **Step 18: Boot the dev server to verify the toolchain**

Run: `bun run dev` (then stop it)
Expected: server starts on `http://localhost:3000`, page shows "Hello" with no console/build errors.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "chore: scaffold SvelteKit, remove React toolchain"
```

---

## Task 2: Pure timer logic (TDD)

The heart of the app: sequence data + pure transition functions. Written test-first.

**Files:**

- Create: `src/lib/workout.ts`
- Test: `src/lib/workout.test.ts`

**Interfaces:**

- Produces:
  - `type WorkoutState = { currentIndex: number; timeLeft: number; isRunning: boolean }`
  - `type Cue = 'start' | 'tick' | 'success'`
  - `type Transition = { state: WorkoutState; cues: Cue[] }`
  - `WORKOUT_SEQUENCE: { label: string; duration: number }[]`
  - `isRest(step: { label: string }): boolean`
  - `tick(s: WorkoutState): Transition`
  - `start(s: WorkoutState): Transition`
  - `next(s: WorkoutState): Transition`
  - `prev(s: WorkoutState): Transition`
- Consumed by: `src/routes/+page.svelte` (Task 3).

- [ ] **Step 1: Write the failing tests** — `src/lib/workout.test.ts`

```ts
import { describe, expect, it } from 'vitest'
import {
  WORKOUT_SEQUENCE,
  isRest,
  next,
  prev,
  start,
  tick,
  type WorkoutState,
} from './workout'

const at = (
  currentIndex: number,
  timeLeft: number,
  isRunning = true,
): WorkoutState => ({
  currentIndex,
  timeLeft,
  isRunning,
})

describe('sequence', () => {
  it('has 25 steps starting with a non-Rest exercise and 10s Rests', () => {
    expect(WORKOUT_SEQUENCE).toHaveLength(25)
    expect(isRest(WORKOUT_SEQUENCE[0])).toBe(false)
    expect(isRest(WORKOUT_SEQUENCE[1])).toBe(true)
    expect(isRest(WORKOUT_SEQUENCE[24])).toBe(false)
  })
})

describe('tick', () => {
  it('counts down without cues above the last 5 seconds', () => {
    expect(tick(at(0, 30))).toEqual({ state: at(0, 29), cues: [] })
    expect(tick(at(0, 6))).toEqual({ state: at(0, 5), cues: [] })
  })

  it('emits a tick cue for each of the last 5 seconds', () => {
    expect(tick(at(0, 5))).toEqual({ state: at(0, 4), cues: ['tick'] })
    expect(tick(at(0, 1))).toEqual({ state: at(0, 0), cues: ['tick'] })
  })

  it('advances exercise -> rest with a success cue only', () => {
    expect(tick(at(0, 0))).toEqual({ state: at(1, 10), cues: ['success'] })
  })

  it('advances rest -> exercise with a start cue only', () => {
    expect(tick(at(1, 0))).toEqual({ state: at(2, 30), cues: ['start'] })
  })

  it('wraps after the last step, stops running, emits success then start', () => {
    expect(tick(at(24, 0))).toEqual({
      state: at(0, 30, false),
      cues: ['success', 'start'],
    })
  })
})

describe('start', () => {
  it('starts running and cues start at the beginning of an exercise', () => {
    expect(start(at(0, 30, false))).toEqual({
      state: at(0, 30, true),
      cues: ['start'],
    })
  })

  it('starts running with no cue mid-exercise', () => {
    expect(start(at(0, 20, false))).toEqual({
      state: at(0, 20, true),
      cues: [],
    })
  })

  it('starts running with no cue on a Rest step', () => {
    expect(start(at(1, 10, false))).toEqual({
      state: at(1, 10, true),
      cues: [],
    })
  })
})

describe('next', () => {
  it('leaves an active exercise with success, enters Rest with no start', () => {
    expect(next(at(0, 30))).toEqual({ state: at(1, 10), cues: ['success'] })
  })

  it('leaves Rest with no success, enters exercise with start', () => {
    expect(next(at(1, 10))).toEqual({ state: at(2, 30), cues: ['start'] })
  })

  it('wraps to the first step and preserves isRunning', () => {
    expect(next(at(24, 30, false))).toEqual({
      state: at(0, 30, false),
      cues: ['start'],
    })
  })
})

describe('prev', () => {
  it('wraps backward from the first step, success then start', () => {
    expect(prev(at(0, 30))).toEqual({
      state: at(24, 30),
      cues: ['success', 'start'],
    })
  })

  it('leaves an active exercise with success, enters Rest with no start', () => {
    expect(prev(at(2, 30))).toEqual({ state: at(1, 10), cues: ['success'] })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/lib/workout.test.ts`
Expected: FAIL — cannot resolve `./workout`.

- [ ] **Step 3: Implement `src/lib/workout.ts`**

```ts
export type WorkoutStep = { label: string; duration: number }
export type WorkoutState = {
  currentIndex: number
  timeLeft: number
  isRunning: boolean
}
export type Cue = 'start' | 'tick' | 'success'
export type Transition = { state: WorkoutState; cues: Cue[] }

const REST = 'Rest'

export const WORKOUT_SEQUENCE: WorkoutStep[] = [
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
]

export const isRest = (step: { label: string }): boolean => step.label === REST

const advance = (i: number): number => (i + 1) % WORKOUT_SEQUENCE.length
const retreat = (i: number): number =>
  (i - 1 + WORKOUT_SEQUENCE.length) % WORKOUT_SEQUENCE.length

// Cues fired when moving off `fromIndex` onto `toIndex`.
// Leaving an active exercise -> success; entering an exercise -> start. Rest emits neither.
const stepCues = (
  fromIndex: number,
  toIndex: number,
  leavingActive: boolean,
): Cue[] => {
  const cues: Cue[] = []
  if (leavingActive && !isRest(WORKOUT_SEQUENCE[fromIndex]))
    cues.push('success')
  if (!isRest(WORKOUT_SEQUENCE[toIndex])) cues.push('start')
  return cues
}

export function tick(s: WorkoutState): Transition {
  if (s.timeLeft > 0) {
    const cues: Cue[] = s.timeLeft <= 5 ? ['tick'] : []
    return { state: { ...s, timeLeft: s.timeLeft - 1 }, cues }
  }
  const toIndex = advance(s.currentIndex)
  const completed = s.currentIndex === WORKOUT_SEQUENCE.length - 1
  return {
    state: {
      currentIndex: toIndex,
      timeLeft: WORKOUT_SEQUENCE[toIndex].duration,
      isRunning: completed ? false : s.isRunning,
    },
    cues: stepCues(s.currentIndex, toIndex, true),
  }
}

export function start(s: WorkoutState): Transition {
  const atStepStart = s.timeLeft === WORKOUT_SEQUENCE[s.currentIndex].duration
  const cues: Cue[] =
    !isRest(WORKOUT_SEQUENCE[s.currentIndex]) && atStepStart ? ['start'] : []
  return { state: { ...s, isRunning: true }, cues }
}

function skip(s: WorkoutState, toIndex: number): Transition {
  return {
    state: {
      ...s,
      currentIndex: toIndex,
      timeLeft: WORKOUT_SEQUENCE[toIndex].duration,
    },
    cues: stepCues(s.currentIndex, toIndex, s.timeLeft > 0),
  }
}

export function next(s: WorkoutState): Transition {
  return skip(s, advance(s.currentIndex))
}

export function prev(s: WorkoutState): Transition {
  return skip(s, retreat(s.currentIndex))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test -- src/lib/workout.test.ts`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/workout.ts src/lib/workout.test.ts
git commit -m "feat: add pure workout timer logic with tests"
```

---

## Task 3: Wire up the UI — sounds, components, and page

Build the thin Svelte shell around the tested core and verify behavior in a browser.

**Files:**

- Create: `src/lib/sounds.ts`, `src/lib/Controls.svelte`, `src/lib/WorkoutPanel.svelte`
- Modify: `src/routes/+page.svelte` (replace the placeholder)

**Interfaces:**

- Consumes: `WORKOUT_SEQUENCE`, `isRest`, `tick`, `start`, `next`, `prev`, `Transition`, `Cue` from `$lib/workout` (Task 2).
- `sounds.ts` produces: `play(cue: Cue): void`.
- `Controls.svelte` props: `{ isRunning: boolean; onStart: () => void; onPause: () => void; onNext: () => void; onPrevious: () => void }`.
- `WorkoutPanel.svelte` props: `{ currentWorkoutLabel: string; timeLeft: number; isRunning: boolean; nextWorkoutLabel?: string; onStart; onPause; onNext; onPrevious }`.

- [ ] **Step 1: Write `src/lib/sounds.ts`**

```ts
import { browser } from '$app/environment'
import startUrl from './assets/sounds/start.mp3'
import successUrl from './assets/sounds/success.mp3'
import tickUrl from './assets/sounds/tick.mp3'
import type { Cue } from './workout'

const urls: Record<Cue, string> = {
  start: startUrl,
  tick: tickUrl,
  success: successUrl,
}
const cache: Partial<Record<Cue, HTMLAudioElement>> = {}

export function play(cue: Cue): void {
  if (!browser) return
  const audio = (cache[cue] ??= new Audio(urls[cue]))
  audio.currentTime = 0
  audio
    .play()
    .catch((error) => console.error(`Error playing ${cue} sound:`, error))
}
```

- [ ] **Step 2: Write `src/lib/Controls.svelte`**

```svelte
<script lang="ts">
  import { Pause, Play, SkipBack, SkipForward } from 'lucide-svelte'

  let {
    isRunning,
    onStart,
    onPause,
    onNext,
    onPrevious,
  }: {
    isRunning: boolean
    onStart: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
  } = $props()
</script>

<div class="flex space-x-4">
  <button
    type="button"
    onclick={onPrevious}
    class="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
    aria-label="Previous"
  >
    <SkipBack size={24} />
  </button>
  <button
    type="button"
    onclick={isRunning ? onPause : onStart}
    class="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
    aria-label={isRunning ? 'Pause' : 'Start'}
  >
    {#if isRunning}
      <Pause size={24} />
    {:else}
      <Play size={24} />
    {/if}
  </button>
  <button
    type="button"
    onclick={onNext}
    class="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
    aria-label="Next"
  >
    <SkipForward size={24} />
  </button>
</div>
```

- [ ] **Step 3: Write `src/lib/WorkoutPanel.svelte`**

```svelte
<script lang="ts">
  import Controls from './Controls.svelte'

  let {
    currentWorkoutLabel,
    timeLeft,
    isRunning,
    nextWorkoutLabel,
    onStart,
    onPause,
    onNext,
    onPrevious,
  }: {
    currentWorkoutLabel: string
    timeLeft: number
    isRunning: boolean
    nextWorkoutLabel?: string
    onStart: () => void
    onPause: () => void
    onNext: () => void
    onPrevious: () => void
  } = $props()
</script>

<div class="flex flex-col items-center justify-center p-8">
  <h2 class="text-4xl font-bold">{currentWorkoutLabel}</h2>
  {#if nextWorkoutLabel}
    <p class="text-xl font-bold text-gray-800 mt-2">
      Up next: {nextWorkoutLabel}
    </p>
  {/if}
  <div class="text-6xl font-mono mb-8 mt-4">
    {String(timeLeft).padStart(2, '0')}s
  </div>
  <Controls {isRunning} {onStart} {onPause} {onNext} {onPrevious} />
</div>
```

- [ ] **Step 4: Replace `src/routes/+page.svelte`**

```svelte
<script lang="ts">
  import WorkoutPanel from '$lib/WorkoutPanel.svelte'
  import { play } from '$lib/sounds'
  import {
    WORKOUT_SEQUENCE,
    isRest,
    next,
    prev,
    start,
    tick,
    type Transition,
  } from '$lib/workout'

  let currentIndex = $state(0)
  let timeLeft = $state(WORKOUT_SEQUENCE[0].duration)
  let isRunning = $state(false)

  const currentWorkout = $derived(WORKOUT_SEQUENCE[currentIndex])
  const nextWorkoutLabel = $derived(
    WORKOUT_SEQUENCE[(currentIndex + 1) % WORKOUT_SEQUENCE.length].label,
  )

  function apply({ state, cues }: Transition) {
    currentIndex = state.currentIndex
    timeLeft = state.timeLeft
    isRunning = state.isRunning
    for (const cue of cues) play(cue)
  }

  // Only `isRunning` is read synchronously, so the interval is created/torn down
  // exactly when running toggles — not on every tick.
  $effect(() => {
    if (!isRunning) return
    const id = setInterval(
      () => apply(tick({ currentIndex, timeLeft, isRunning })),
      1000,
    )
    return () => clearInterval(id)
  })
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <header class="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10">
    <h1 class="text-4xl font-bold text-center">7 Minute Workout</h1>
  </header>
  <main class="flex-grow flex flex-col items-center justify-center">
    <WorkoutPanel
      currentWorkoutLabel={currentWorkout.label}
      {timeLeft}
      {isRunning}
      nextWorkoutLabel={isRest(currentWorkout) ? nextWorkoutLabel : undefined}
      onStart={() => apply(start({ currentIndex, timeLeft, isRunning }))}
      onPause={() => (isRunning = false)}
      onNext={() => apply(next({ currentIndex, timeLeft, isRunning }))}
      onPrevious={() => apply(prev({ currentIndex, timeLeft, isRunning }))}
    />
  </main>
</div>
```

- [ ] **Step 5: Type-check and lint**

Run: `bun run lint`
Expected: `eslint` and `svelte-check` both pass with 0 errors. Fix any reported issues before continuing.

- [ ] **Step 6: Verify behavior in a browser**

Run: `bun run dev`, open `http://localhost:3000`. Confirm:

- Title "7 Minute Workout", first exercise "Jumping Jacks", timer "30s".
- Play starts the countdown; the last 5 seconds tick audibly; finishing an exercise plays the success sound and auto-advances to "Rest" showing "Up next: …".
- Previous / Next jump steps and play the expected cues; Pause halts the countdown.

Use the `run` or `verify` skill to drive and observe the app.

- [ ] **Step 7: Commit**

```bash
git add src/lib/sounds.ts src/lib/Controls.svelte src/lib/WorkoutPanel.svelte src/routes/+page.svelte
git commit -m "feat: build Svelte UI shell over workout logic"
```

---

## Task 4: Final polish — format, docs, full verification

Bring docs in line with the new stack and confirm the whole toolchain is green.

**Files:**

- Modify: `CLAUDE.md`, `README.md`
- Format: all files via Prettier

**Interfaces:** none (docs + verification only).

- [ ] **Step 1: Format the whole project**

Run: `bun run format`
Expected: Prettier rewrites files to the configured style; re-run shows "unchanged".

- [ ] **Step 2: Update `CLAUDE.md`**

Rewrite the stack-specific sections so they describe the Svelte app. Replace the "Overview", "Package manager", "Commands", "Architecture", and "Conventions" sections with content matching reality:

- Overview: SvelteKit + Svelte 5 runes + Vite + Tailwind v4, single prerendered route.
- Package manager: bun (unchanged).
- Commands: `bun run dev`/`start` (port 3000), `build`, `serve`, `test`, `test -- <path>`, `lint` (eslint + svelte-check), `format` (prettier).
- Architecture: pure logic in `src/lib/workout.ts` (tested), thin shell `src/routes/+page.svelte` (three `$state` runes + `$effect` interval), `src/lib/sounds.ts` browser-guarded audio, presentational `WorkoutPanel`/`Controls`, `"Rest"` magic label.
- Conventions: Prettier + eslint-plugin-svelte, single quotes/no semicolons/spaces, `$lib` alias, inlined component prop types.

Remove all references to React, TanStack Router, `routeTree.gen.ts`, the `-components/` routing convention, shadcn, and Biome.

- [ ] **Step 3: Update `README.md`**

Replace React/TanStack/CRA references with the SvelteKit stack and the command list from Step 2. Keep the app description and any workout content. Remove shadcn install instructions.

- [ ] **Step 4: Full verification pass**

Run each and confirm success:

- `bun run test` → all tests pass
- `bun run lint` → 0 errors
- `bun run build` → static build succeeds (prerenders `/`)
- `bun run serve` → production preview serves the working app

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: update CLAUDE.md and README for Svelte stack"
```

---

## Self-Review Notes

- **Spec coverage:** framework (SvelteKit) ✓ Task 1; in-place replace ✓ Task 1 deletes; prettier+eslint+svelte-check ✓ Tasks 1 & 4; TDD core-logic test ✓ Task 2; cleanup shadcn/utils/cursorrules ✓ Task 1; audio browser-guard ✓ Task 3; static prerender ✓ Task 1 (`+layout.ts`, adapter-static); Tailwind v4 kept ✓ Task 1; identical behavior ✓ Task 2 tests + Task 3 verify.
- **Type consistency:** `WorkoutState`/`Cue`/`Transition` defined in Task 2 and consumed unchanged in Task 3; `play(cue: Cue)` and component prop shapes match the Interfaces blocks.
- **Behavioral fidelity:** cue rules in `workout.ts` transcribe the original `index.tsx` interval/`handleStart`/`handleNext`/`handlePrevious` exactly, including the quirk that completing the final step still emits `start` before stopping.
