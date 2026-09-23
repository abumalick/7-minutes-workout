export type ExerciseInstruction = {
  slug: string;
  label: string;
  duration: number;
  text: string;
  // Repeated short holds instead of one continuous one: `count` holds of `hold`
  // seconds, separated by `pause` seconds of release. `duration` is then unused.
  sets?: { count: number; hold: number; pause: number };
  image?: { accent: string; view: string; pose: string };
};
