import type { Workout, WorkoutCues, WorkoutStep } from "./workout";
import type { ExerciseInstruction } from "./exercise";
import { instructions as backPainInstructions } from "./back-pain-instructions";
import { instructions as officeBackInstructions } from "./office-back-instructions";
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
  const exercises: WorkoutStep[] = instructions.map((ex) => ({
    label: ex.label,
    duration: ex.duration,
    voice: assetFor(voiceUrls, id, ex.slug, "mp3"),
    image: assetFor(imageUrls, id, ex.slug, "png"),
  }));
  return {
    id,
    name,
    cues: FR_CUES,
    // Every exercise — including the first — is preceded by a Rest that previews it:
    // the rest carries that exercise's voice so the instruction is spoken (and
    // replayable) during the rest, and the workout opens on a get-ready rest.
    steps: exercises.flatMap((step) => [{ label: "Rest", duration: 10, voice: step.voice }, step]),
  };
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

export const WORKOUTS: Workout[] = [sevenMinuteWorkout, backPainWorkout, officeBackWorkout];
