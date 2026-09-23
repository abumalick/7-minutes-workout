import type { Workout, WorkoutCues, WorkoutStep } from "./workout";
import type { ExerciseInstruction } from "./exercise";
import { instructions as backPainInstructions } from "./back-pain-instructions";
import { instructions as backPhaseAInstructions } from "./back-phase-a-instructions";
import { instructions as officeBackInstructions } from "./office-back-instructions";
import { instructions as sciaticaInstructions } from "./sciatica-instructions";
import { instructions as sevenMinuteInstructions } from "./seven-minute-instructions";

const cueUrls = import.meta.glob("./assets/voice/cues/fr/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const cueFor = (name: string): string => {
  const entry = Object.entries(cueUrls).find(([path]) => path.endsWith(`/cues/fr/${name}.mp3`));
  if (!entry) throw new Error(`Missing cue asset ${name}`);
  return entry[1];
};

// One shared French instructor cue set for every workout.
const FR_CUES: WorkoutCues = {
  go: cueFor("go"),
  countdown: {
    1: cueFor("1"),
    2: cueFor("2"),
    3: cueFor("3"),
    4: cueFor("4"),
    5: cueFor("5"),
  },
};

const voiceUrls = import.meta.glob("./assets/voice/**/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const imageUrls = import.meta.glob("./assets/images/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const assetFor = (urls: Record<string, string>, id: string, slug: string, ext: string): string => {
  const entry = Object.entries(urls).find(([path]) => path.endsWith(`/${id}/${slug}.${ext}`));
  if (!entry) throw new Error(`Missing ${ext} asset for ${id}/${slug}`);
  return entry[1];
};

export const buildWorkout = (
  id: string,
  name: string,
  instructions: ExerciseInstruction[],
): Workout => {
  const steps = instructions.flatMap((ex): WorkoutStep[] => {
    const group = ex.slug;
    const voice = assetFor(voiceUrls, id, ex.slug, "mp3");
    const image = assetFor(imageUrls, id, ex.slug, "png");
    const sets = ex.sets;
    // A set becomes numbered holds split by pauses; the pauses carry no voice, so they
    // keep their own length and only beep instead of repeating the instruction.
    const exercise: WorkoutStep[] = sets
      ? Array.from({ length: sets.count }, (_, k): WorkoutStep[] => [
          ...(k > 0 ? [{ label: "Rest", duration: sets.pause, group }] : []),
          { label: `${ex.label} ${k + 1}/${sets.count}`, duration: sets.hold, voice, image, group },
        ]).flat()
      : [{ label: ex.label, duration: ex.duration, voice, image, group }];
    // Every exercise — including the first — is preceded by a Rest that previews it:
    // the rest carries that exercise's voice so the instruction is spoken (and
    // replayable) during the rest, and the workout opens on a get-ready rest.
    return [{ label: "Rest", duration: 10, voice, group }, ...exercise];
  });
  return { id, name, cues: FR_CUES, steps };
};

export const sevenMinuteWorkout = buildWorkout(
  "seven-minute",
  "Entraînement 7 minutes",
  sevenMinuteInstructions,
);

export const backPainWorkout = buildWorkout(
  "back-pain",
  "Routine mal de dos",
  backPainInstructions,
);

export const officeBackWorkout = buildWorkout(
  "office-back",
  "Mal de dos au bureau",
  officeBackInstructions,
);

export const sciaticaWorkout = buildWorkout(
  "sciatica",
  "Soulagement sciatique",
  sciaticaInstructions,
);

export const backPhaseAWorkout = buildWorkout(
  "back-phase-a",
  "Dos & sciatique — phase A",
  backPhaseAInstructions,
);

export const WORKOUTS: Workout[] = [
  sevenMinuteWorkout,
  backPainWorkout,
  officeBackWorkout,
  sciaticaWorkout,
  backPhaseAWorkout,
];
