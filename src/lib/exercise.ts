export type ExerciseInstruction = {
  slug: string;
  label: string;
  duration: number;
  text: string;
  image?: { accent: string; view: string; pose: string };
};
