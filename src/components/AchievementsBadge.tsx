import { useState } from 'react'
import type { Database } from '../lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']

interface Achievement {
  id: string
  name: string
  description: string
  detailedDescription: string
  icon: string
  threshold: number
  color: string
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    name: 'Первые шаги',
    description: 'Выполни первую задачу',
    detailedDescription: 'Поздравляем! Ты выполнил свою самую первую задачу. Это начало большого пути к достижению целей!',
    icon: '🌟',
    threshold: 1,
    color: 'from-yellow-400 to-orange-400'
  },
  {
    id: 'task_master_5',
    name: 'Активный старт',
    description: 'Выполни 5 задач',
    detailedDescription: 'Отличная работа! Ты уже выполнил 5 задач. Продолжай в том же духе!',
    icon: '⭐',
    threshold: 5,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    id: 'task_master_10',
    name: 'Трудолюбивый',
    description: 'Выполни 10 задач',
    detailedDescription: 'Потрясающе! Целых 10 выполненных задач. Ты показываешь настоящее упорство!',
    icon: '🏅',
    threshold: 10,
    color: 'from-green-400 to-emerald-400'
  },
  {
    id: 'task_master_25',
    name: 'Профессионал',
    description: 'Выполни 25 задач',
    detailedDescription: 'Невероятно! 25 выполненных задач - это серьёзное достижение. Ты настоящий профессионал!',
    icon: '🎯',
    threshold: 25,
    color: 'from-purple-400 to-pink-400'
  },
  {
    id: 'task_master_50',
    name: 'Мастер задач',
    description: 'Выполни 50 задач',
    detailledDescription: 'Фантастика! Полсотни выполненных задач - это выдающийся результат. Ты мастер своего дела!',
    icon: '👑',
    threshold: 50,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'points_100',
    name: 'Коллекционер',
    description: 'Набери 100 баллов',
    detailedDescription: 'Великолепно! Ты собрал уже 100 баллов. Продолжай копить их для крутых наград!',
    icon: '💎',
    threshold: 100,
    color: 'from-cyan-400 to-blue-400'
  },
  {
    id: 'points_250',
    name: 'Звезда',
    description: 'Набери 250 баллов',
    detailedDescription: 'Восхитительно! 250 баллов - это показатель твоего старания и целеустремлённости!',
    icon: '✨',
    threshold: 250,
    color: 'from-indigo-400 to-purple-400'
  },
  {
    id: 'points_500',
    name: 'Чемпион',
    description: 'Набери 500 баллов',
    detailedDescription: 'Потрясающе! 500 баллов - ты настоящий чемпион. Так держать!',
    icon: '🏆',
    threshold: 500,
    color: 'from-amber-400 to-yellow-500'
  },
  {
    id: 'points_1000',
    name: 'Легенда',
    description: 'Набери 1000 баллов',
    detailedDescription: 'Легендарно! Тысяча баллов - это невероятное достижение. Ты вошёл в историю!',
    icon: '🌟',
    threshold: 1000,
    color: 'from-pink-500 to-rose-500'
  }
]

interface AchievementsBadgeProps {
  tasks: Task[]
  totalPoints: number
}

export default function AchievementsBadge({ tasks, totalPoints }: AchievementsBadgeProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  
  const completedTasks = tasks.filter(t => t.is_completed).length

  const getAchievementStatus = (achievement: Achievement) => {
    const current = achievement.id.startsWith('points_') ? totalPoints : completedTasks
    const isUnlocked = current >= achievement.threshold
    const progress = Math.min((current / achievement.threshold) * 100, 100)
    
    return { isUnlocked, progress, current }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          Достижения
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {ACHIEVEMENTS.map(achievement => {
            const { isUnlocked, progress } = getAchievementStatus(achievement)
            
            return (
              <button
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                  isUnlocked
                    ? 'border-yellow-300 bg-gradient-to-br ' + achievement.color + ' shadow-lg hover:shadow-xl'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className={`text-4xl sm:text-5xl mb-2 ${isUnlocked ? 'animate-bounce' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className={`font-bold text-xs sm:text-sm mb-1 ${
                    isUnlocked ? 'text-white' : 'text-gray-600'
                  }`}>
                    {achievement.name}
                  </h3>
                  {!isUnlocked && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(progress)}%
                      </p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Модальное окно с деталями достижения */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { isUnlocked, progress, current } = getAchievementStatus(selectedAchievement)
              
              return (
                <>
                  {/* Заголовок с градиентом */}
                  <div className={`bg-gradient-to-br ${selectedAchievement.color} p-6 sm:p-8 text-white relative`}>
                    <button
                      onClick={() => setSelectedAchievement(null)}
                      className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="text-center">
                      <div className={`text-7xl mb-4 ${isUnlocked ? 'animate-bounce-twice' : 'grayscale opacity-70'}`}>
                        {selectedAchievement.icon}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                        {selectedAchievement.name}
                      </h3>
                      <p className="text-white text-opacity-90 text-sm sm:text-base">
                        {selectedAchievement.description}
                      </p>
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="p-6 sm:p-8">
                    {isUnlocked ? (
                      <>
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 text-center">
                          <div className="text-4xl mb-2">🎉</div>
                          <p className="text-green-700 font-bold text-lg">
                            Достижение получено!
                          </p>
                        </div>
                        <p className="text-gray-700 text-center leading-relaxed">
                          {selectedAchievement.detailedDescription}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              Прогресс
                            </span>
                            <span className="text-sm font-bold text-purple-600">
                              {current} / {selectedAchievement.threshold}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
                            Ещё {selectedAchievement.threshold - current} до достижения
                          </p>
                        </div>
                        <p className="text-gray-600 text-center text-sm sm:text-base">
                          {selectedAchievement.description}
                        </p>
                      </>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounceTwice {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          25% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-bounce-twice {
          animation: bounceTwice 1s ease-in-out 2;
        }
      `}</style>
    </>
  )
}
