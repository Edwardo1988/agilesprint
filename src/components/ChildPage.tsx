import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Award, Star, TrendingUp, Calendar, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { AchievementsBadge } from './AchievementsBadge';

type Child = Database['public']['Tables']['children']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Sprint = Database['public']['Tables']['sprints']['Row'];

interface ChildPageProps {
  accessCode: string;
}

export function ChildPage({ accessCode }: ChildPageProps) {
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildData();
  }, [accessCode]);

  const loadChildData = async () => {
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('*')
      .eq('access_code', accessCode)
      .maybeSingle();

    if (childError || !childData) {
      console.error('Error loading child:', childError);
      setLoading(false);
      return;
    }

    setChild(childData);

    // Загружаем активный спринт
    const { data: sprintData } = await supabase
      .from('sprints')
      .select('*')
      .eq('child_id', childData.id)
      .eq('is_active', true)
      .maybeSingle();

    setActiveSprint(sprintData);

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('child_id', childData.id)
      .order('completed', { ascending: true })
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
    } else {
      setTasks(tasksData || []);
    }

    setLoading(false);
  };

  const completeTask = async (task: Task) => {
    if (task.completed || !child) return;

    const now = new Date().toISOString();

    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        completed: true,
        completed_at: now,
      })
      .eq('id', task.id);

    if (taskError) {
      console.error('Error completing task:', taskError);
      return;
    }

    const { error: childError } = await supabase
      .from('children')
      .update({
        total_points: child.total_points + task.points,
      })
      .eq('id', child.id);

    if (childError) {
      console.error('Error updating points:', childError);
      return;
    }

    setTasks(tasks.map(t =>
      t.id === task.id
        ? { ...t, completed: true, completed_at: now }
        : t
    ));

    setChild({ ...child, total_points: child.total_points + task.points });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Загрузка...</div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Страница не найдена</h1>
          <p className="text-gray-600">Проверь свою ссылку</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Задачи текущего спринта
  const sprintTasks = activeSprint ? tasks.filter(t => t.sprint_id === activeSprint.id) : [];
  const sprintCompletedTasks = sprintTasks.filter(t => t.completed);
  const sprintPendingTasks = sprintTasks.filter(t => !t.completed);
  const sprintProgress = sprintTasks.length > 0 ? Math.round((sprintCompletedTasks.length / sprintTasks.length) * 100) : 0;
  const sprintPoints = sprintCompletedTasks.reduce((sum, t) => sum + t.points, 0);

  const getDaysLeft = () => {
    if (!activeSprint) return 0;
    const end = new Date(activeSprint.end_date);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: child.avatar_color }}
            >
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">Привет, {child.name}!</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Вот твои задачи на сегодня</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Баллы</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{child.total_points}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Выполнено</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{completedTasks.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium opacity-90">Прогресс</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{completionRate}%</p>
            </div>
          </div>
        </div>

        {activeSprint && sprintTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
              <div className="w-full sm:flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-start gap-2">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 flex-shrink-0 mt-1" />
                  <span className="break-words">Текущий спринт: {activeSprint.name}</span>
                </h2>
                {activeSprint.goal && (
                  <div className="flex items-start gap-2 mt-2 text-gray-600">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm sm:text-base lg:text-lg break-words">{activeSprint.goal}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium opacity-90">Осталось</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{getDaysLeft()} дн.</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium opacity-90">Прогресс</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{sprintProgress}%</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium opacity-90">Баллы</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{sprintPoints}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2 text-gray-600">
                <span>Выполнено задач в спринте: {sprintCompletedTasks.length}/{sprintTasks.length}</span>
                <span>{sprintProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full h-3 sm:h-4 transition-all duration-500"
                  style={{ width: `${sprintProgress}%` }}
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 mt-4 break-words">
              📅 {new Date(activeSprint.start_date).toLocaleDateString('ru-RU')} - {new Date(activeSprint.end_date).toLocaleDateString('ru-RU')}
            </p>
          </div>
        )}

        {sprintPendingTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 flex-shrink-0" />
              Задачи спринта
            </h2>
            <div className="space-y-4">
              {sprintPendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-300 transition-all bg-indigo-50/30"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      onClick={() => completeTask(task)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-3 border-indigo-400 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center flex-shrink-0"
                    >
                      <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-xl text-gray-900 mb-2 break-words">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {task.points} баллов
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingTasks.filter(t => !t.sprint_id).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
              Другие задачи
            </h2>
            <div className="space-y-4">
              {pendingTasks.filter(t => !t.sprint_id).map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all bg-white"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      onClick={() => completeTask(task)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-3 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center flex-shrink-0"
                    >
                      <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-xl text-gray-900 mb-2 break-words">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {task.points} баллов
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
              Выполненные задачи
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 rounded-xl bg-green-50 border-2 border-green-200"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-green-900 line-through break-words">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm sm:text-base text-green-700 mt-1 break-words">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <span className="text-xs sm:text-sm font-medium text-green-600">
                          +{task.points} баллов
                        </span>
                        {task.completed_at && (
                          <span className="text-xs sm:text-sm text-green-600">
                            {new Date(task.completed_at).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <AchievementsBadge
            totalPoints={child.total_points}
            completedTasksCount={completedTasks.length}
          />
        )}

        {tasks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <Award className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Пока нет задач</h2>
            <p className="text-sm sm:text-base text-gray-600">Скоро родители добавят задачи для тебя!</p>
          </div>
        )}
      </div>
    </div>
  );
}
