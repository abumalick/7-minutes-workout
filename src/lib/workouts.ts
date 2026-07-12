import type { Workout } from './workout'

export const sevenMinuteWorkout: Workout = {
  id: 'seven-minute',
  name: '7 Minute Workout',
  steps: [
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
  ],
}

export const WORKOUTS: Workout[] = [sevenMinuteWorkout]
