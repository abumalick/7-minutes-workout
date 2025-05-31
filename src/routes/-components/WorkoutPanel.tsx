import Controls from './Controls'
import CountdownTimer from './CountdownTimer'
import WorkoutLabel from './WorkoutLabel'

function WorkoutPanel({
  currentWorkoutLabel,
  timeLeft,
  onStart,
  onPause,
  onNext,
  onPrevious,
  isRunning,
}: {
  currentWorkoutLabel: string
  timeLeft: number
  onStart: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  isRunning: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <WorkoutLabel label={currentWorkoutLabel} />
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
