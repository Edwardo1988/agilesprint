// src/components/BalloonView.tsx
import { useState } from 'react'
import type { Database } from '../lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

interface BalloonViewProps {
  tasks: Task[]
  onCompleteTask: (taskId: string) => void
}

const BALLOON_COLORS = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-indigo-400 to-indigo-600',
  'from-orange-400 to-orange-600',
]

export default function BalloonView({ tasks, onCompleteTask }: BalloonViewProps) {
  const [poppingBalloon, setPoppingBalloon] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const activeTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  // Определяем размер шарика в зависимости от баллов
  const getBalloonSize = (points: number) => {
    if (points >= 30) return { size: 'w-40 h-40 sm:w-44 sm:h-44', text: 'text-3xl', blur: 'w-10 h-14' }
    if (points >= 20) return { size: 'w-36 h-36 sm:w-40 sm:h-40', text: 'text-2xl', blur: 'w-9 h-12' }
    if (points >= 10) return { size: 'w-32 h-32 sm:w-36 sm:h-36', text: 'text-xl', blur: 'w-8 h-12' }
    return { size: 'w-28 h-28 sm:w-32 sm:h-32', text: 'text-lg', blur: 'w-7 h-10' }
  }

  const handleBalloonClick = (task: Task) => {
    if (task.is_completed || poppingBalloon) return

    // Анимация лопания
    setPoppingBalloon(task.id)
    setShowConfetti(true)

    // Звук лопания (опционально)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZizkJG2m98OScTgwOUKXh8LRhGwU7kdny0H4xBSp+zPLaizsIHGrA8+GeUAoNTqPg8LNfGgU8lNvyznwvBSl6y/HajDwIG2u88OKZTQsNTKHf7q9cGAQ9kdry0n8xBSp6yvDajTsJG2m58N+ZTBISH2y+8OOXSwwNTqPg8LJeGgU8lNvyznwvBSp7y/HajDwIG2u88OKZTQsNTKHf7q9cGAQ9kdry0n8xBSp6yvDajTsJG2m58N+ZUQ0NTaLf7rBcGgU8lNry0H4wBSp6yvHbiz0IHGu+8OSaSw0OTqHf77BcGwU7k9ry0X8xBit5yvHbjDwJG2q68OGYTQsNTqPf8LJfGgU8lNvy0H4wBSp6y/HajDwIG2u88OKZTQsNTaHe7q9cGAQ+kdry0n8xBSp6yvHajDsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp7y/HajDwIG2u88OKZTQsNTaHe7bBcGAQ9kdry0n8xBSp6yvHajTsJG2m68OGYTQsOTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2u88OKZTQsNTaHe7bBcGAQ9kdry0n8xBSp6yvHajTsJHGm68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBSp6yvHajTsJG2m68OGYTQwNTqLg8LJeGgU8lNvyz34wBSp6y/HajDwIG2y88OKZTQsNTaHe7bBcGAQ9kdry0oAxBQ==')
      audio.play().catch(() => {}) // Игнорируем ошибки
    } catch (e) {}

    // Завершаем задачу
    setTimeout(() => {
      onCompleteTask(task.id)
      setPoppingBalloon(null)
      
      // Убираем конфетти через секунду
      setTimeout(() => setShowConfetti(false), 1000)
    }, 600)
  }

  const getBalloonColor = (index: number) => {
    return BALLOON_COLORS[index % BALLOON_COLORS.length]
  }

  return (
    <div className="relative">
      {/* Конфетти */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              {['⭐', '✨', '🎉', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Активные задачи (шарики) */}
      {activeTasks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-12">
          {activeTasks.map((task, index) => {
            const isPoppingThis = poppingBalloon === task.id
            const balloonSize = getBalloonSize(task.points)

            return (
              <div
                key={task.id}
                className="flex flex-col items-center"
              >
                {/* Шарик */}
                <div
                  onClick={() => handleBalloonClick(task)}
                  className={`
                    relative cursor-pointer transition-all duration-300
                    ${isPoppingThis ? 'animate-pop' : 'hover:scale-110 hover:-translate-y-2'}
                  `}
                >
                  {/* Круглый шар */}
                  <div className={`
                    ${balloonSize.size} rounded-full
                    bg-gradient-to-br ${getBalloonColor(index)}
                    shadow-lg hover:shadow-2xl
                    flex items-center justify-center
                    relative overflow-hidden
                    ${isPoppingThis ? 'opacity-0' : 'opacity-100'}
                  `}>
                    {/* Блик на шарике */}
                    <div className={`absolute top-3 left-4 ${balloonSize.blur} bg-white opacity-30 rounded-full blur-sm`} />
                    
                    {/* Баллы */}
                    <div className={`text-white font-bold ${balloonSize.text} z-10`}>
                      {task.points}⭐
                    </div>
                  </div>

                  {/* Ниточка (длина зависит от размера шарика) */}
                  <div 
                    className="w-0.5 bg-gray-400 mx-auto"
                    style={{ 
                      height: task.points >= 20 ? '40px' : task.points >= 10 ? '32px' : '24px' 
                    }}
                  />

                  {/* Взрыв (при лопании) */}
                  {isPoppingThis && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl animate-ping">💥</div>
                    </div>
                  )}
                </div>

                {/* Название задачи */}
                <div className="mt-2 text-center max-w-[120px]">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎈</div>
          <p className="text-xl text-gray-500">Все шарики лопнули! 🎉</p>
          <p className="text-sm text-gray-400 mt-2">Отличная работа!</p>
        </div>
      )}

      {/* Выполненные задачи */}
      {completedTasks.length > 0 && (
        <div className="mt-8 pt-8 border-t-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            ✅ Лопнувшие шарики ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💥</div>
                  <div>
                    <p className="font-semibold text-gray-800">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-gray-600">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{task.points}⭐
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-pop {
          animation: pop 0.6s ease-out forwards;
        }

        .animate-confetti {
          animation: confetti 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
