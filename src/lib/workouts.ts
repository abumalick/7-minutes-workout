import type { Workout, WorkoutStep } from "./workout";
import { backPainInstructions } from "./back-pain-instructions";

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

const voiceUrls = import.meta.glob("./assets/voice/back-pain/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const voiceFor = (slug: string): string => {
  const entry = Object.entries(voiceUrls).find(([path]) => path.endsWith(`/${slug}.mp3`));
  if (!entry) throw new Error(`Missing voice audio for ${slug}`);
  return entry[1];
};

const imageUrls = import.meta.glob("./assets/images/back-pain/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const imageFor = (slug: string): string => {
  const entry = Object.entries(imageUrls).find(([path]) => path.endsWith(`/${slug}.png`));
  if (!entry) throw new Error(`Missing image for ${slug}`);
  return entry[1];
};

const backPainExercises: WorkoutStep[] = backPainInstructions.map((ex) => ({
  label: ex.label,
  duration: ex.duration,
  voice: voiceFor(ex.slug),
  image: imageFor(ex.slug),
}));

export const backPainWorkout: Workout = {
  id: "back-pain",
  name: "Routine mal de dos",
  steps: backPainExercises.flatMap((step, i) =>
    i === 0 ? [step] : [{ label: "Rest", duration: 10 }, step],
  ),
};

export const WORKOUTS: Workout[] = [sevenMinuteWorkout, backPainWorkout];
