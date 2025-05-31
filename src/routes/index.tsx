import { createFileRoute } from '@tanstack/react-router'
import React from 'react'
import useInterval from '../hooks/useInterval'
import WorkoutPanel from './-components/WorkoutPanel'
import tickSoundFile from '../assets/sounds/tick.mp3'
import successSoundFile from '../assets/sounds/success.mp3'
import startSoundFile from '../assets/sounds/start.mp3'

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

  const tickAudio = React.useMemo(() => new Audio(tickSoundFile), [])
  const successAudio = React.useMemo(() => new Audio(successSoundFile), [])
  const startAudio = React.useMemo(() => new Audio(startSoundFile), [])

  const playStartSound = () => {
    startAudio.currentTime = 0
    startAudio
      .play()
      .catch((error) => console.error('Error playing start sound:', error))
  }

  const playTickSound = () => {
    tickAudio.currentTime = 0
    tickAudio
      .play()
      .catch((error) => console.error('Error playing tick sound:', error))
  }
  const playFinishSound = () => {
    successAudio.currentTime = 0
    successAudio
      .play()
      .catch((error) => console.error('Error playing success sound:', error))
  }

  const currentWorkout = WORKOUT_SEQUENCE[currentIndex]
  const nextWorkoutIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
  const nextWorkoutLabel = WORKOUT_SEQUENCE[nextWorkoutIndex].label

  useInterval(
    () => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1)
        // Play tick sound for last 5 seconds (e.g., when timeLeft goes from 6 to 5, down to 1)
        if (timeLeft <= 5 && timeLeft >= 1) {
          playTickSound()
        }
      } else {
        // Current workout/rest finished
        if (currentWorkout.label !== 'Rest') {
          playFinishSound() // Play success sound if a non-Rest workout finished
        }

        // Auto-advance to next workout
        const nextIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
        setCurrentIndex(nextIndex)
        setTimeLeft(WORKOUT_SEQUENCE[nextIndex].duration)

        // Play start sound if the new workout is not 'Rest'
        if (WORKOUT_SEQUENCE[nextIndex].label !== 'Rest') {
          playStartSound()
        }

        // Keep running for the next exercise unless it's the last one
        if (nextIndex === 0 && currentIndex === WORKOUT_SEQUENCE.length - 1) {
          // Completed full sequence
          setIsRunning(false)
        }
      }
    },
    isRunning ? 1000 : null,
  )

  const handleStart = () => {
    setIsRunning(true)
    if (
      currentWorkout.label !== 'Rest' &&
      timeLeft === WORKOUT_SEQUENCE[currentIndex].duration
    ) {
      // Play start sound only if it's the beginning of a non-rest workout
      playStartSound()
    }
  }
  const handlePause = () => setIsRunning(false)
  const handleNext = () => {
    if (currentWorkout.label !== 'Rest' && timeLeft > 0) {
      // If current workout is active and not rest
      playFinishSound() // Consider it finished
    }
    const nextIndex = (currentIndex + 1) % WORKOUT_SEQUENCE.length
    setCurrentIndex(nextIndex)
    setTimeLeft(WORKOUT_SEQUENCE[nextIndex].duration)
    if (WORKOUT_SEQUENCE[nextIndex].label !== 'Rest') {
      playStartSound()
    }
  }
  const handlePrevious = () => {
    if (currentWorkout.label !== 'Rest' && timeLeft > 0) {
      // If current workout is active and not rest
      playFinishSound() // Consider it finished
    }
    const prevIndex =
      (currentIndex - 1 + WORKOUT_SEQUENCE.length) % WORKOUT_SEQUENCE.length
    setCurrentIndex(prevIndex)
    setTimeLeft(WORKOUT_SEQUENCE[prevIndex].duration)
    if (WORKOUT_SEQUENCE[prevIndex].label !== 'Rest') {
      playStartSound()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="absolute top-0 left-0 right-0 py-8 bg-gray-100 z-10">
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
