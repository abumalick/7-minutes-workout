# Back-pain routine exercise images — design

## Goal

Give each of the 18 back-pain exercises a **two-tone accent silhouette** image so the
user can see the pose while the timer runs. Images are AI-generated in the ChatGPT
web UI (using the user's subscription), saved into the repo, and displayed in
`WorkoutPanel`.

**Scope:** back-pain routine only. The 7-minute workout is untouched.

## Why this approach

- Generation is automated by **`scripts/generate-images.ts`** (run with `bun`),
  which calls the OpenAI `gpt-image-1` API and writes
  `src/lib/assets/images/back-pain/<slug>.png`. It skips existing files unless
  `--force`, accepts slug filters for one-offs, and retries each image (output-stage
  moderation occasionally false-flags floor/stretch poses as "sexual", so prompts
  are framed as a clinical, non-suggestive exercise diagram). The script — not the
  copy-paste doc — is the source of truth for the prompts.
  (The earlier plan routed prompts through the ChatGPT web UI because codex here is
  ChatGPT-subscription-only; we switched to the API once a key was available.)
- Poses are grounded in the source routine video
  (`https://youtu.be/o-Yawof_CgE`, chapters map 1:1 to the exercises). Frames were
  used only as private reference to write accurate pose descriptions — **no real
  photo ships** in the app.
- 512×512 transparent PNGs (~1.3 MB total for all 19), sized at 2× the max on-screen
  display.

## Exercise count

19, not 18: the hip flexion is split into left (`01-flexion-hanche`) and right
(`01b-flexion-hanche-droit`).

## Visual style

- Flat two-tone pictogram: solid **slate `#334155`** body silhouette, **blue
  `#2563eb`** accent on the muscle being stretched/worked.
- **Square 1:1**, **transparent background**, whole body centered with margin.
- No face, no clothing detail, no mat, no equipment, no text, no shadows.
- Side profile unless a pose reads better from another angle (noted per exercise).

## Style preamble (prepend / establish once per ChatGPT conversation)

> Minimalist flat two-tone pictogram of a single human figure doing a mobility
> exercise. Solid dark slate (#334155) body silhouette, clean smooth vector shapes,
> no face, no clothing detail, no interior muscle lines. Highlight **[ACTIVE PART]**
> in bright blue (#2563eb) to mark the muscle being stretched or worked. Whole body
> in frame, centered, generous margin, transparent background, no mat, no equipment,
> no text, no shadows. Square 1:1, side profile unless noted.

## Per-exercise prompts

Each line replaces `[ACTIVE PART]` in the preamble and describes the pose. Generate
all in **one ChatGPT conversation** so the style stays consistent; save each result
as `<slug>.png`.

1. **01-flexion-hanche** — Lying on back in profile; one knee pulled toward the
   chest with both hands around the shin, the other leg extended flat on the floor.
   Accent: the bent hip and lower back.
2. **02-double-flexion-hanche** — Lying on back in profile; both knees pulled to the
   chest, hands clasped around the shins, head resting down. Accent: the lower back.
3. **03-pont-fessier** — Lying on back in profile; knees bent, feet flat, hips lifted
   into a bridge forming a straight diagonal from knees to shoulders, arms flat
   alongside. Accent: the glutes and hips.
4. **04-lordose-cyphose** — Lying on back in profile; knees bent, feet flat, hips
   down, arms alongside, pressing the lower back gently into the floor (pelvic tilt).
   Accent: the lower back / lumbar spine.
5. **05-rotation** — Lying on back, seen from a high 3/4 angle; knees bent and dropped
   together to one side in a spinal twist, shoulders staying flat, arms out in a T.
   Accent: the lower back and obliques.
6. **06-piriforme-gauche** — Lying on back, figure-4: left ankle crossed over the
   right thigh, both hands reaching to pull the right thigh toward the chest.
   Accent: the left glute (buttock).
7. **07-piriforme-droit** — Mirror of the previous: right ankle crossed over the left
   thigh, hands pulling the left thigh toward the chest. Accent: the right glute.
8. **08-carre-lombes-gauche** — Kneeling / side-sitting on the floor, torso bent to
   one side with the top arm reaching up and over the head in a long lateral curve.
   Accent: the lengthened (stretched) side of the trunk under the raised arm.
9. **09-carre-lombes-droit** — Mirror of the previous, bending to the other side with
   the opposite arm overhead. Accent: the lengthened side of the trunk under the
   raised arm.
10. **10-priere** — Child's pose in profile: kneeling with hips sitting back toward
    the heels, torso folded forward, both arms stretched far forward flat on the
    floor, head down. Accent: the whole spine and lower back.
11. **11-dos-de-chat** — On all fours (quadruped) in profile, spine rounded upward
    into a "cat" arch, head tucked. Accent: the rounded spine / mid and lower back.
12. **12-gainage-alterne** — On all fours (bird-dog) in profile: one arm extended
    straight forward and the opposite leg extended straight back, forming one
    horizontal line, torso level. Accent: the lower back and core.
13. **13-extension-vertebrale** — Lying face down (prone) in profile, chest and head
    lifted in a gentle back extension propped on the forearms/hands, hips on the
    floor (cobra/sphinx). Accent: the lower back.
14. **14-plan-posterieur** — Lying face down (prone) in profile, arms extended forward
    past the head and legs lifted off the floor in a shallow arc (superman). Accent:
    the whole posterior chain — back, glutes, and hamstrings.
15. **15-psoas-gauche** — Half-kneeling lunge in profile: left knee down on the floor,
    right foot forward flat with the front knee bent ~90°, hips pressed forward,
    torso upright. Accent: the front of the left hip (hip flexor / groin crease).
16. **16-psoas-droit** — Mirror of the previous: right knee down, left foot forward,
    hips pressed forward. Accent: the front of the right hip.
17. **17-anterieure** — Kneeling upright and arching the back, reaching the arms/hands
    back toward the heels (camel-like), opening the whole front of the body. Accent:
    the front of the torso — abdominals and chest.
18. **18-accroupi** — Deep full squat seen from a slight 3/4 front angle: heels flat on
    the floor, hips low, torso upright between the knees, arms reaching forward for
    balance. Accent: the lower back and spine.

## Generation workflow

1. **Validate:** generate exercise **03-pont-fessier** first (clear, unambiguous
   pose). Check the look; adjust the preamble if needed.
2. **Produce:** in the same conversation, generate the remaining 17. Save each as
   `<slug>.png` (transparent PNG).
3. Drop all 18 into `src/lib/assets/images/back-pain/`.

## Code integration

Mirrors the existing `voice` pattern exactly.

- **`src/lib/workout.ts`** — add optional `image?: string` to `WorkoutStep`.
- **`src/lib/workouts.ts`** — resolve images via
  `import.meta.glob('./assets/images/back-pain/*.png', { eager: true, query: '?url', import: 'default' })`
  and attach per exercise by slug with an `imageFor(slug)` helper shaped like
  `voiceFor`.
- **`src/routes/+page.svelte`** — pass the current step's `image` to `WorkoutPanel`;
  during a `Rest` step pass the _next_ step's image (pairs with the existing "Up
  next" label).
- **`src/lib/WorkoutPanel.svelte`** — add an optional `image?` prop; render it above
  the timer (`<img>`, sized responsively, empty `alt` — decorative).
- **`src/lib/workouts.test.ts`** — assert every back-pain exercise step has an
  `image`, mirroring the existing voice well-formedness check.

## Decisions (confirmed)

- Square 1:1, transparent PNG.
- Slate body + blue accent.
- Rest steps show the next exercise's image.

## Out of scope / not doing

- No image generation via API key or local diffusion model.
- No images for the 7-minute workout.
- No animation — one still pose per exercise.

## Open questions

None outstanding.
