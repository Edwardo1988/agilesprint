import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Award, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { AchievementsBadge } from './AchievementsBadge';

type Child = Database['public']['Tables']['children']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface ChildPageProps {
  accessCode: string;
}

export function ChildPage({ accessCode }: ChildPageProps) {
  const [child, setChild] = useState<Child | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg"
              style={{ backgroundColor: child.avatar_color }}
            >
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Привет, {child.name}!</h1>
              <p className="text-gray-600 mt-1">Вот твои задачи на сегодня</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Баллы</span>
              </div>
              <p className="text-3xl font-bold">{child.total_points}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Выполнено</span>
              </div>
              <p className="text-3xl font-bold">{completedTasks.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Прогресс</span>
              </div>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
          </div>
        </div>

        {pendingTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Circle className="w-6 h-6 text-orange-500" />
              Задачи к выполнению
            </h2>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all bg-white"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => completeTask(task)}
                      className="w-10 h-10 rounded-full border-3 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center flex-shrink-0"
                    >
                      <Circle className="w-6 h-6 text-gray-400" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Award className="w-4 h-4" />
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
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Выполненные задачи
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-xl bg-green-50 border-2 border-green-200"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-green-900 line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-green-700 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-medium text-green-600">
                          +{task.points} баллов
                        </span>
                        {task.completed_at && (
                          <span className="text-sm text-green-600">
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
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Пока нет задач</h2>
            <p className="text-gray-600">Скоро родители добавят задачи для тебя!</p>
          </div>
        )}
      </div>
    </div>
  );
}
