import Controls from './Controls'
import CountdownTimer from './CountdownTimer'

function WorkoutPanel({
  currentWorkoutLabel,
  timeLeft,
  onStart,
  onPause,
  onNext,
  onPrevious,
  isRunning,
  nextWorkoutLabel,
}: {
  currentWorkoutLabel: string
  timeLeft: number
  onStart: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  isRunning: boolean
  nextWorkoutLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-4">{currentWorkoutLabel}</h2>
      {nextWorkoutLabel && (
        <p className="text-xl text-gray-600 mt-2">
          Up next: {nextWorkoutLabel}
        </p>
      )}
      <CountdownTimer timeLeft={timeLeft} />
      <Controls
        onStart={onStart}
        onPause={onPause}
        onNext={onNext}
        onPrevious={onPrevious}
        isRunning={isRunning}
      />
    </div>
  )
}

export default WorkoutPanel
