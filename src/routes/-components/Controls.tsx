import { Play, Pause, SkipForward, SkipBack } from 'lucide-react'

function Controls({
  onStart,
  onPause,
  onNext,
  onPrevious,
  isRunning,
}: {
  onStart: () => void
  onPause: () => void
  onNext: () => void
  onPrevious: () => void
  isRunning: boolean
}) {
  return (
    <div className="flex space-x-4">
      <button
        type="button"
        onClick={onPrevious}
        className="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
        aria-label="Previous"
      >
        <SkipBack size={24} />
      </button>
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        aria-label={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="p-3 bg-gray-300 rounded-full hover:bg-gray-400"
        aria-label="Next"
      >
        <SkipForward size={24} />
      </button>
    </div>
  )
}

export default Controls
