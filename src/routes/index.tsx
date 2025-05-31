import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import useInterval from '../hooks/useInterval'
import WorkoutPanel from './-components/WorkoutPanel'

const WORKOUT_SEQUENCE = [
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
]
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [timeLeft, setTimeLeft] = React.useState(WORKOUT_SEQUENCE[0].duration)
  const [isRunning, setIsRunning] = React.useState(false)

  const currentWorkout = WORKOUT_SEQUENCE[currentIndex]
  const nextWorkoutIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
  const nextWorkoutLabel = WORKOUT_SEQUENCE[nextWorkoutIndex].label

  useInterval(
    () => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1)
      } else {
        // Auto-advance to next workout
        const nextIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
        setCurrentIndex(nextIndex)
        setTimeLeft(WORKOUT_SEQUENCE[nextIndex].duration)
        // Keep running for the next exercise unless it's the last one
        if (nextIndex === 0 && currentIndex === WORKOUT_SEQUENCE.length - 1) {
          // Completed full sequence
          setIsRunning(false)
        }
      }
    },
    isRunning ? 1000 : null,
  )

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
    setCurrentIndex(nextIndex)
    setTimeLeft(WORKOUT_SEQUENCE[nextIndex].duration)
  }
  const handlePrevious = () => {
    const prevIndex =
      (currentIndex - 1 + WORKOUT_SEQUENCE.length) % WORKOUT_SEQUENCE.length
    setCurrentIndex(prevIndex)
    setTimeLeft(WORKOUT_SEQUENCE[prevIndex].duration)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="py-8">
        <h1 className="text-4xl font-bold text-center">7 Minute Workout</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center">
        <WorkoutPanel
          currentWorkoutLabel={currentWorkout.label}
          timeLeft={timeLeft}
          onStart={handleStart}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isRunning={isRunning}
          nextWorkoutLabel={
            currentWorkout.label === 'Rest' ? nextWorkoutLabel : undefined
          }
        />
      </main>
    </div>
  )
}
