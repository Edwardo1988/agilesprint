import { useState } from 'react';
import { Award, Trophy, Star, Zap, Crown, Medal, X } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ReactNode;
  color: string;
  requirement: number;
  type: 'points' | 'tasks';
}

const achievements: Achievement[] = [
  {
    id: 'first-steps',
    title: 'Первые шаги',
    description: 'Выполни 1 задачу',
    detailedDescription: 'Поздравляем! Ты выполнил свою первую задачу! Это только начало твоего пути к успеху. Продолжай в том же духе!',
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-400 to-orange-500',
    requirement: 1,
    type: 'tasks',
  },
  {
    id: 'task-master',
    title: 'Мастер задач',
    description: 'Выполни 5 задач',
    detailedDescription: 'Отлично! Ты выполнил уже 5 задач! Ты показываешь настоящую ответственность и целеустремлённость. Так держать!',
    icon: <Medal className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
    requirement: 5,
    type: 'tasks',
  },
  {
    id: 'super-achiever',
    title: 'Супер исполнитель',
    description: 'Выполни 10 задач',
    detailedDescription: 'Невероятно! 10 выполненных задач - это серьёзное достижение! Ты демонстрируешь упорство и трудолюбие. Гордись собой!',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
    requirement: 10,
    type: 'tasks',
  },
  {
    id: 'point-collector',
    title: 'Коллекционер баллов',
    description: 'Набери 50 баллов',
    detailedDescription: 'Ты набрал 50 баллов! Твои усилия не остались незамеченными. Продолжай зарабатывать баллы и становись ещё лучше!',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
    requirement: 50,
    type: 'points',
  },
  {
    id: 'point-master',
    title: 'Мастер баллов',
    description: 'Набери 100 баллов',
    detailedDescription: 'Фантастика! 100 баллов - это впечатляющий результат! Ты настоящий мастер выполнения задач. Так держать!',
    icon: <Award className="w-6 h-6" />,
    color: 'from-pink-400 to-pink-600',
    requirement: 100,
    type: 'points',
  },
  {
    id: 'champion',
    title: 'Чемпион',
    description: 'Набери 200 баллов',
    detailedDescription: 'Невероятное достижение! 200 баллов - ты настоящий чемпион! Твои родители могут гордиться тобой. Ты лучший!',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-amber-400 to-yellow-600',
    requirement: 200,
    type: 'points',
  },
];

interface AchievementsBadgeProps {
  totalPoints: number;
  completedTasksCount: number;
}

export function AchievementsBadge({ totalPoints, completedTasksCount }: AchievementsBadgeProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const earnedAchievements = achievements.filter((achievement) => {
    if (achievement.type === 'points') {
      return totalPoints >= achievement.requirement;
    }
    return completedTasksCount >= achievement.requirement;
  });

  const unlockedCount = earnedAchievements.length;
  const totalCount = achievements.length;

  const getAchievementProgress = (achievement: Achievement) => {
    if (achievement.type === 'points') {
      return Math.min(100, Math.round((totalPoints / achievement.requirement) * 100));
    }
    return Math.min(100, Math.round((completedTasksCount / achievement.requirement) * 100));
  };

  const isAchievementEarned = (achievement: Achievement) => {
    return achievement.type === 'points'
      ? totalPoints >= achievement.requirement
      : completedTasksCount >= achievement.requirement;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            Достижения
          </h2>
          <span className="text-sm font-semibold text-gray-600">
            {unlockedCount} / {totalCount}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {achievements.map((achievement) => {
            const isEarned = isAchievementEarned(achievement);
            const progress = getAchievementProgress(achievement);

            return (
              <div
                key={achievement.id}
                onClick={() => setSelectedAchievement(achievement)}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${
                  isEarned
                    ? 'border-yellow-300 bg-gradient-to-br shadow-lg'
                    : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
                }`}
                style={
                  isEarned
                    ? {
                        background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`,
                        backgroundImage: `linear-gradient(135deg, ${
                          achievement.color.includes('yellow')
                            ? '#fbbf24, #f59e0b'
                            : achievement.color.includes('blue')
                            ? '#60a5fa, #2563eb'
                            : achievement.color.includes('green')
                            ? '#4ade80, #16a34a'
                            : achievement.color.includes('purple')
                            ? '#c084fc, #9333ea'
                            : achievement.color.includes('pink')
                            ? '#f472b6, #db2777'
                            : '#fbbf24, #d97706'
                        })`,
                      }
                    : undefined
                }
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 ${
                    isEarned ? 'bg-white/90 text-gray-900' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {achievement.icon}
                </div>
                <h3
                  className={`font-bold text-xs sm:text-sm mb-1 ${
                    isEarned ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {achievement.title}
                </h3>
                <p
                  className={`text-xs ${
                    isEarned ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  {achievement.description}
                </p>

                {!isEarned && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{progress}%</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {unlockedCount === totalCount && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-center">
            <p className="text-white font-bold text-base sm:text-lg">
              🎉 Поздравляем! Все достижения разблокированы! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${
                    selectedAchievement.color.includes('yellow')
                      ? '#fbbf24, #f59e0b'
                      : selectedAchievement.color.includes('blue')
                      ? '#60a5fa, #2563eb'
                      : selectedAchievement.color.includes('green')
                      ? '#4ade80, #16a34a'
                      : selectedAchievement.color.includes('purple')
                      ? '#c084fc, #9333ea'
                      : selectedAchievement.color.includes('pink')
                      ? '#f472b6, #db2777'
                      : '#fbbf24, #d97706'
                  })`,
                }}
              >
                <div className="text-white scale-150">
                  {selectedAchievement.icon}
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {selectedAchievement.title}
              </h3>

              <p className="text-base sm:text-lg text-gray-600 mb-4">
                {selectedAchievement.description}
              </p>

              <div className="w-full bg-gray-100 rounded-xl p-4 mb-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {selectedAchievement.detailedDescription}
                </p>
              </div>

              {isAchievementEarned(selectedAchievement) ? (
                <div className="w-full bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Достижение получено!
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Прогресс</span>
                    <span className="font-semibold">{getAchievementProgress(selectedAchievement)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getAchievementProgress(selectedAchievement)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedAchievement.type === 'points'
                      ? `Ещё ${selectedAchievement.requirement - totalPoints} баллов до достижения`
                      : `Ещё ${selectedAchievement.requirement - completedTasksCount} задач до достижения`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
