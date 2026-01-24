import { Award, Trophy, Star, Zap, Crown, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
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
    icon: <Star className="w-6 h-6" />,
    color: 'from-yellow-400 to-orange-500',
    requirement: 1,
    type: 'tasks',
  },
  {
    id: 'task-master',
    title: 'Мастер задач',
    description: 'Выполни 5 задач',
    icon: <Medal className="w-6 h-6" />,
    color: 'from-blue-400 to-blue-600',
    requirement: 5,
    type: 'tasks',
  },
  {
    id: 'super-achiever',
    title: 'Супер исполнитель',
    description: 'Выполни 10 задач',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-green-400 to-green-600',
    requirement: 10,
    type: 'tasks',
  },
  {
    id: 'point-collector',
    title: 'Коллекционер баллов',
    description: 'Набери 50 баллов',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-purple-400 to-purple-600',
    requirement: 50,
    type: 'points',
  },
  {
    id: 'point-master',
    title: 'Мастер баллов',
    description: 'Набери 100 баллов',
    icon: <Award className="w-6 h-6" />,
    color: 'from-pink-400 to-pink-600',
    requirement: 100,
    type: 'points',
  },
  {
    id: 'champion',
    title: 'Чемпион',
    description: 'Набери 200 баллов',
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
  const earnedAchievements = achievements.filter((achievement) => {
    if (achievement.type === 'points') {
      return totalPoints >= achievement.requirement;
    }
    return completedTasksCount >= achievement.requirement;
  });

  const unlockedCount = earnedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Достижения
        </h2>
        <span className="text-sm font-semibold text-gray-600">
          {unlockedCount} / {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const isEarned =
            achievement.type === 'points'
              ? totalPoints >= achievement.requirement
              : completedTasksCount >= achievement.requirement;

          return (
            <div
              key={achievement.id}
              className={`p-5 rounded-xl border-2 transition-all ${
                isEarned
                  ? 'border-yellow-300 bg-gradient-to-br shadow-lg'
                  : 'border-gray-200 bg-gray-50 opacity-60'
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
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  isEarned ? 'bg-white/90 text-gray-900' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {achievement.icon}
              </div>
              <h3
                className={`font-bold text-sm mb-1 ${
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
            </div>
          );
        })}
      </div>

      {unlockedCount === totalCount && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-center">
          <p className="text-white font-bold text-lg">
            Поздравляем! Все достижения разблокированы!
          </p>
        </div>
      )}
    </div>
  );
}
