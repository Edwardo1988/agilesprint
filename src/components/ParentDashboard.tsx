import { useState, useEffect } from 'react';
import { Plus, Users, CheckCircle2, Copy, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { SprintManager } from './SprintManager';

type Child = Database['public']['Tables']['children']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Sprint = Database['public']['Tables']['sprints']['Row'];

interface ParentDashboardProps {
  parentId: string;
  accessCode: string;
}

export function ParentDashboard({ parentId, accessCode }: ParentDashboardProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(10);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);

  useEffect(() => {
    loadChildren();
  }, [parentId]);

  useEffect(() => {
    if (selectedChild) {
      loadTasks(selectedChild);
      loadActiveSprint(selectedChild);
    }
  }, [selectedChild]);

  const loadChildren = async () => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading children:', error);
      return;
    }

    setChildren(data || []);
    if (data && data.length > 0 && !selectedChild) {
      setSelectedChild(data[0].id);
    }
  };

  const loadTasks = async (childId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    setTasks(data || []);
  };

  const loadActiveSprint = async (childId: string) => {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('child_id', childId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error loading active sprint:', error);
      return;
    }

    setActiveSprint(data);
  };

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const addChild = async () => {
    if (!newChildName.trim()) return;

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const emojis = ['😀', '😎', '🤗', '😊', '🥳', '🤩', '😇', '🦄', '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦋', '🌟', '⭐', '🌈', '🎨', '🎭', '🎪', '🎯', '🎮', '🚀', '✨', '💫', '🔥'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const { data, error } = await supabase
      .from('children')
      .insert({
        parent_id: parentId,
        name: newChildName.trim(),
        access_code: generateAccessCode(),
        avatar_color: randomColor,
        avatar_emoji: randomEmoji,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding child:', error);
      return;
    }

    setChildren([...children, data]);
    setNewChildName('');
    if (!selectedChild) {
      setSelectedChild(data.id);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedChild) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        child_id: selectedChild,
        sprint_id: activeSprint?.id || null,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        points: newTaskPoints,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setTasks([data, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPoints(10);
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const copyChildLink = (child: Child) => {
    const link = `${window.location.origin}?child=${child.access_code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(child.access_code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedChildData = children.find(c => c.id === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
                <span className="break-words">Панель родителя</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 break-all">Ваш код доступа: <span className="font-mono font-semibold text-blue-600">{accessCode}</span></p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Добавить ребенка</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Имя ребенка"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addChild()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addChild}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Добавить
              </button>
            </div>
          </div>

          {children.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedChild === child.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0"
                      style={{ backgroundColor: child.avatar_color }}
                    >
                      {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{child.name}</h3>
                      <p className="text-sm text-gray-600">{child.total_points} баллов</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyChildLink(child);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Copy className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{copiedCode === child.access_code ? 'Скопировано!' : 'Ссылка'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedChildData && (
          <>
            <SprintManager childId={selectedChildData.id} childName={selectedChildData.name} />
            
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 break-words">
                Задачи для {selectedChildData.name}
              </h2>

              {activeSprint && (
                <div className="mb-4 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-indigo-700 font-medium break-words">
                    📌 Новые задачи будут добавлены в спринт: <span className="font-bold break-words">{activeSprint.name}</span>
                  </p>
                </div>
              )}

              <div className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Добавить новую задачу</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Название задачи"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Описание (необязательно)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Баллы"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 0)}
                    min="1"
                    className="w-full sm:w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTask}
                    className="w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    Добавить задачу
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Пока нет задач</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 sm:p-5 rounded-xl border-2 transition-all ${
                      task.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {task.completed && (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-base sm:text-lg break-words ${
                          task.completed ? 'text-green-900 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`mt-1 text-sm sm:text-base break-words ${
                            task.completed ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                          <span className="text-xs sm:text-sm font-medium text-blue-600">
                            {task.points} баллов
                          </span>
                          {task.completed && task.completed_at && (
                            <span className="text-xs sm:text-sm text-green-600">
                              Выполнено {new Date(task.completed_at).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
