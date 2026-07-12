# Back-Pain Exercise Routine

Reference documentation for a back-pain (rehab/mobility) routine extracted from a
YouTube video. This is **not** the app's default "7 Minute Workout" — it's a longer,
low-intensity routine kept here as a candidate sequence and a source reference.

## Source

- **Title**: _ROUTINE D'EXERCICES CONTRE LE MAL DE DOS (ÉTIREMENTS, ASSOUPLISSEMENTS, RENFORCEMENT)_
- **Author**: Benjamin Brochet — [reeducpourtous.com](https://www.reeducpourtous.com/)
- **URL**: https://youtu.be/o-Yawof_CgE
- **Length**: 12:56
- **Focus**: Stretching (_étirements_), mobility (_assouplissements_), and strengthening
  (_renforcement_) for the lower back.

## Exercise sequence

Timestamps are the video's chapter markers. **Duration is derived from the gap between
consecutive chapters** — it includes the presenter's demonstration and explanation, so it
is _not_ a recommended hold time. Use it as ordering/reference, not as timer values.

| #   | Start | ~Gap  | Exercise (FR)                                   | English                           |
| --- | ----- | ----- | ----------------------------------------------- | --------------------------------- |
| 1   | 1:10  | 23s   | assouplissement flexion de hanche               | Hip flexion mobility              |
| 2   | 1:33  | 30s   | assouplissement global double flexion de hanche | Double hip flexion (global)       |
| 3   | 2:03  | 27s   | pont fessier                                    | Glute bridge                      |
| 4   | 2:30  | 26s   | lordose lombaire & cyphose                      | Lumbar lordosis ↔ kyphosis        |
| 5   | 2:56  | 48s   | assouplissement en rotation                     | Rotational mobility               |
| 6   | 3:44  | 45s   | étirement muscle piriforme                      | Piriformis stretch                |
| 7   | 4:29  | 45s   | étirement muscle carré des lombes               | Quadratus lumborum stretch        |
| 8   | 5:14  | 53s   | assouplissement "prière"                        | "Prayer" stretch (child's pose)   |
| 9   | 6:07  | 30s   | assouplissement "dos de chat"                   | Cat stretch                       |
| 10  | 6:37  | 45s   | gainage alterné                                 | Alternating core plank (bird-dog) |
| 11  | 7:22  | 45s   | extension vertébrale                            | Spinal extension                  |
| 12  | 8:07  | 42s   | renforcement plan postérieur                    | Posterior chain strengthening     |
| 13  | 8:49  | 42s   | étirement muscle psoas iliaque                  | Iliopsoas stretch                 |
| 14  | 9:31  | 39s   | étirement partie antérieure                     | Anterior stretch (abs / pecs)     |
| 15  | 10:10 | ~2:46 | exercice "accroupi"                             | Squat / deep-squat hold           |

Notes:

- Everything before **1:10** is the intro.
- Exercise 15's gap runs to the **12:56** end and overlaps the outro, so its true duration
  is unknown.

## Using this in the app

The app's `WORKOUT_SEQUENCE` (`src/lib/workout.ts`) is a `{ label, duration }[]` with `"Rest"`
steps between exercises. This routine differs in two ways:

1. **No rest intervals** — it's a continuous mobility flow, not HIIT.
2. **Chapter gaps aren't hold times.** To turn this into a real timer, replace the `~Gap`
   column with intentional hold durations (e.g. a flat 30s per stretch, longer for
   strengthening holds) and decide whether to insert `"Rest"` steps.

Until those durations are set deliberately, treat this file as reference only.
