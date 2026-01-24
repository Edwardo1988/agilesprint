import { useState, useEffect } from 'react';
import { Calendar, Target, Plus, PlayCircle, StopCircle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Sprint = Database['public']['Tables']['sprints']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];

interface SprintManagerProps {
  childId: string;
  childName: string;
}

export function SprintManager({ childId, childName }: SprintManagerProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [sprintTasks, setSprintTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadSprints();
  }, [childId]);

  useEffect(() => {
    if (activeSprint) {
      loadSprintTasks(activeSprint.id);
    }
  }, [activeSprint]);

  const loadSprints = async () => {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sprints:', error);
      return;
    }

    setSprints(data || []);
    const active = data?.find(s => s.is_active);
    setActiveSprint(active || null);
  };

  const loadSprintTasks = async (sprintId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('completed', { ascending: true });

    if (error) {
      console.error('Error loading sprint tasks:', error);
      return;
    }

    setSprintTasks(data || []);
  };

  const createSprint = async () => {
    if (!newSprintName.trim()) return;

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Деактивируем текущий активный спринт
    if (activeSprint) {
      await supabase
        .from('sprints')
        .update({ is_active: false })
        .eq('id', activeSprint.id);
    }

    const { data, error } = await supabase
      .from('sprints')
      .insert({
        child_id: childId,
        name: newSprintName.trim(),
        goal: newSprintGoal.trim(),
        start_date: today.toISOString(),
        end_date: nextWeek.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sprint:', error);
      return;
    }

    setSprints([data, ...sprints]);
    setActiveSprint(data);
    setNewSprintName('');
    setNewSprintGoal('');
    setShowCreateForm(false);
  };

  const completeSprint = async () => {
    if (!activeSprint) return;

    const { error } = await supabase
      .from('sprints')
      .update({ is_active: false })
      .eq('id', activeSprint.id);

    if (error) {
      console.error('Error completing sprint:', error);
      return;
    }

    setActiveSprint(null);
    loadSprints();
  };

  const getSprintProgress = () => {
    if (sprintTasks.length === 0) return 0;
    const completed = sprintTasks.filter(t => t.completed).length;
    return Math.round((completed / sprintTasks.length) * 100);
  };

  const getSprintPoints = () => {
    return sprintTasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.points, 0);
  };

  const getDaysLeft = () => {
    if (!activeSprint) return 0;
    const end = new Date(activeSprint.end_date);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 flex-shrink-0" />
          <span className="break-words">Спринты для {childName}</span>
        </h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Новый спринт
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 sm:p-6 bg-indigo-50 rounded-xl">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Создать новый спринт</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Название спринта (например: 'Неделя 1', 'Январь')"
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="Цель спринта (необязательно)"
              value={newSprintGoal}
              onChange={(e) => setNewSprintGoal(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={createSprint}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Создать спринт (7 дней)
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSprint ? (
        <div className="space-y-4">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
              <div className="w-full sm:flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <h3 className="text-xl sm:text-2xl font-bold break-words">{activeSprint.name}</h3>
                </div>
                {activeSprint.goal && (
                  <div className="flex items-start gap-2 mt-2 opacity-90">
                    <Target className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-base sm:text-lg break-words">{activeSprint.goal}</p>
                  </div>
                )}
              </div>
              <button
                onClick={completeSprint}
                className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium whitespace-nowrap"
              >
                <StopCircle className="w-5 h-5 flex-shrink-0" />
                Завершить
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm opacity-90">Осталось дней</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{getDaysLeft()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm opacity-90">Прогресс</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{getSprintProgress()}%</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm opacity-90">Баллы</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{getSprintPoints()}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span>Выполнено задач: {sprintTasks.filter(t => t.completed).length}/{sprintTasks.length}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${getSprintProgress()}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 break-words">
            <p>
              📅 Период: {new Date(activeSprint.start_date).toLocaleDateString('ru-RU')} - {new Date(activeSprint.end_date).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Нет активного спринта</p>
          <p className="mt-2">Создайте новый спринт, чтобы начать планирование задач на неделю</p>
        </div>
      )}

      {sprints.length > 1 && (
        <div className="mt-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">История спринтов</h3>
          <div className="space-y-2">
            {sprints.filter(s => !s.is_active).slice(0, 5).map((sprint) => (
              <div key={sprint.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 break-words">{sprint.name}</h4>
                    {sprint.goal && <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{sprint.goal}</p>}
                  </div>
                  <div className="text-right text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                    <p>{new Date(sprint.start_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
