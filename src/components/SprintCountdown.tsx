// src/components/SprintCountdown.tsx
import { useState, useEffect } from 'react'

interface SprintCountdownProps {
  endDate: string // ISO date string
}

export default function SprintCountdown({ endDate }: SprintCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const end = new Date(endDate).getTime()
    const now = new Date().getTime()
    const difference = end - now

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      expired: false
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-semibold">
        <span className="text-xl">⏰</span>
        <span>Спринт завершён</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">⏱️</span>
      <div className="flex gap-2 text-sm font-semibold">
        {timeLeft.days > 0 && (
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {timeLeft.days}д
          </div>
        )}
        <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
          {String(timeLeft.hours).padStart(2, '0')}ч
        </div>
        <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded">
          {String(timeLeft.minutes).padStart(2, '0')}м
        </div>
        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
          {String(timeLeft.seconds).padStart(2, '0')}с
        </div>
      </div>
    </div>
  )
}
