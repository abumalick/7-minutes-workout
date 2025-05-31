import Controls from './Controls'

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
      <h2 className="text-4xl font-bold">{currentWorkoutLabel}</h2>
      {nextWorkoutLabel && (
        <p className="text-xl font-bold text-gray-800 mt-2">
          Up next: {nextWorkoutLabel}
        </p>
      )}
      <div className="text-6xl font-mono mb-8 mt-4">
        {String(timeLeft).padStart(2, '0')}s
      </div>
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
