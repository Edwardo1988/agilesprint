// src/components/SprintCompletionModal.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Sprint = Database['public']['Tables']['sprints']['Row']

interface SprintCompletionModalProps {
  sprint: Sprint
  onClose: () => void
  onComplete: () => void
}

interface SprintStats {
  tasksCompleted: number
  tasksTotal: number
  pointsEarned: number
  completionPercentage: number
}

export default function SprintCompletionModal({ sprint, onClose, onComplete }: SprintCompletionModalProps) {
  const [stats, setStats] = useState<SprintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Поля ретроспективы
  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatToImprove, setWhatToImprove] = useState('')
  const [actionItems, setActionItems] = useState('')

  useEffect(() => {
    calculateStats()
  }, [sprint.id])

  const calculateStats = async () => {
    setLoading(true)

    // Получаем все задачи спринта
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('is_completed, points')
      .eq('sprint_id', sprint.id)

    if (error) {
      console.error('Error fetching tasks:', error)
      setLoading(false)
      return
    }

    const tasksTotal = tasks?.length || 0
    const tasksCompleted = tasks?.filter(t => t.is_completed).length || 0
    const pointsEarned = tasks
      ?.filter(t => t.is_completed)
      .reduce((sum, t) => sum + (t.points || 0), 0) || 0
    const completionPercentage = tasksTotal > 0 
      ? Math.round((tasksCompleted / tasksTotal) * 100) 
      : 0

    setStats({
      tasksCompleted,
      tasksTotal,
      pointsEarned,
      completionPercentage
    })

    setLoading(false)
  }

  const handleComplete = async () => {
    if (!stats) return

    setSaving(true)

    // 1. Создаём ретроспективу
    const { error: retroError } = await supabase
      .from('sprint_retrospectives')
      .insert([
        {
          sprint_id: sprint.id,
          tasks_completed: stats.tasksCompleted,
          tasks_total: stats.tasksTotal,
          points_earned: stats.pointsEarned,
          completion_percentage: stats.completionPercentage,
          what_went_well: whatWentWell.trim() || null,
          what_to_improve: whatToImprove.trim() || null,
          action_items: actionItems.trim() || null,
        }
      ])

    if (retroError) {
      console.error('Error creating retrospective:', retroError)
      alert('Ошибка при сохранении ретроспективы')
      setSaving(false)
      return
    }

    // 2. Деактивируем спринт
    const { error: sprintError } = await supabase
      .from('sprints')
      .update({ is_active: false })
      .eq('id', sprint.id)

    if (sprintError) {
      console.error('Error completing sprint:', sprintError)
      alert('Ошибка при завершении спринта')
      setSaving(false)
      return
    }

    setSaving(false)
    onComplete()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Подсчитываем статистику...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🏁 Завершение спринта
          </h2>
          <p className="text-lg text-purple-600 font-semibold">{sprint.name}</p>
          {sprint.goal && (
            <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
          )}
        </div>

        {/* Статистика */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Итоги спринта</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {stats?.completionPercentage}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Выполнено</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {stats?.tasksCompleted}
              </div>
              <div className="text-xs text-gray-600 mt-1">Задач выполнено</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-gray-600">
                {stats?.tasksTotal}
              </div>
              <div className="text-xs text-gray-600 mt-1">Всего задач</div>
            </div>

            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">
                {stats?.pointsEarned}
              </div>
              <div className="text-xs text-gray-600 mt-1">Баллов ⭐</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${stats?.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Форма ретроспективы */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800">💭 Ретроспектива</h3>

          {/* Что прошло хорошо */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✅ Что прошло хорошо?
            </label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="Какие успехи были в этом спринте? Что помогло?"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          {/* Что улучшить */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔧 Что можно улучшить?
            </label>
            <textarea
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              placeholder="Какие трудности возникли? Что мешало?"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Действия на следующий спринт */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🚀 Действия на следующий спринт
            </label>
            <textarea
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              placeholder="Что будем делать по-другому? Какие изменения внесём?"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Совет:</strong> Ретроспектива поможет улучшить следующий спринт. 
              Можно заполнить позже, но лучше сделать это пока всё свежо в памяти!
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleComplete}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : '✓ Завершить спринт'}
          </button>
        </div>
      </div>
    </div>
  )
}
