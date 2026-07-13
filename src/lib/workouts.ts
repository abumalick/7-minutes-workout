import type { Workout, WorkoutCues, WorkoutStep } from "./workout";
import type { ExerciseInstruction } from "./exercise";
import { instructions as backPainInstructions } from "./back-pain-instructions";
import { instructions as officeBackInstructions } from "./office-back-instructions";

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

export const sevenMinuteWorkout: Workout = {
  id: "seven-minute",
  name: "Entraînement 7 minutes",
  cues: FR_CUES,
  steps: [
    { label: "Jumping jacks", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Chaise contre le mur", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Pompes", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Crunch abdominal", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Montée sur chaise", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Squats", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Dips triceps sur chaise", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Planche", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Montées de genoux sur place", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Fentes", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Pompe avec rotation", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Planche latérale (gauche)", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Planche latérale (droite)", duration: 30 },
  ],
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
    // The Rest before each exercise previews it: carry that exercise's voice so the
    // instruction is spoken (and replayable) during the rest.
    steps: exercises.flatMap((step, i) =>
      i === 0 ? [step] : [{ label: "Rest", duration: 10, voice: step.voice }, step],
    ),
  };
};

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
