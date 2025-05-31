function CountdownTimer({ timeLeft }: { timeLeft: number }) {
  return (
    <div className="text-6xl font-mono mb-8">
      {String(timeLeft).padStart(2, '0')}s
    </div>
  )
}

export default CountdownTimer
