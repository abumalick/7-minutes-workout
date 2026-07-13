import type { Workout, WorkoutStep } from "./workout";
import type { ExerciseInstruction } from "./exercise";
import { instructions as backPainInstructions } from "./back-pain-instructions";
import { instructions as officeBackInstructions } from "./office-back-instructions";

export const sevenMinuteWorkout: Workout = {
  id: "seven-minute",
  name: "7 Minute Workout",
  steps: [
    { label: "Jumping Jacks", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Wall Sit", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Push-ups", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Abdominal Crunch", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Step-up onto Chair", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Squats", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Triceps Dip on Chair", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Plank", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "High Knees Running in Place", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Lunges", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Push-up and Rotation", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Side Plank (Left)", duration: 30 },
    { label: "Rest", duration: 10 },
    { label: "Side Plank (Right)", duration: 30 },
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
    steps: exercises.flatMap((step, i) =>
      i === 0 ? [step] : [{ label: "Rest", duration: 10 }, step],
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
