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
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Next
      </button>
    </div>
  )
}

export default Controls
