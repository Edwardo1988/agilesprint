import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import SprintCountdown from './SprintCountdown'
import SprintCompletionModal from './SprintCompletionModal'
import RetrospectivesView from './RetrospectivesView'

type Sprint = Database['public']['Tables']['sprints']['Row']

interface SprintManagerProps {
  childId: string
  sprints: Sprint[]
  onUpdate: () => void
}

export default function SprintManager({ childId, sprints, onUpdate }: SprintManagerProps) {
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [editName, setEditName] = useState('')
  const [editGoal, setEditGoal] = useState('')
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null)
  const [activeTab, setActiveTab] = useState<'sprints' | 'retrospectives'>('sprints')
  const [sprintPoints, setSprintPoints] = useState(0)
  const [moveTasks, setMoveTasks] = useState(true) // Переносить задачи по умолчанию

  const activeSprint = sprints.find(s => s.is_active)
  const completedSprints = sprints.filter(s => !s.is_active)

  // Загружаем баллы активного спринта
  useEffect(() => {
    if (activeSprint) {
      loadSprintPoints(activeSprint.id)
    }
  }, [activeSprint?.id])

  const loadSprintPoints = async (sprintId: string) => {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('points, is_completed')
      .eq('sprint_id', sprintId)

    const points = tasks
      ?.filter(t => t.is_completed)
      .reduce((sum, t) => sum + (t.points || 0), 0) || 0

    setSprintPoints(points)
  }

  const createSprint = async () => {
    if (!newSprintName.trim()) return

    let oldSprintId: string | null = null

    // Деактивировать текущий активный спринт
    if (activeSprint) {
      oldSprintId = activeSprint.id
      await supabase
        .from('sprints')
        .update({ is_active: false })
        .eq('id', activeSprint.id)
    }

    // Создать новый спринт (1 неделя)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    const { data: newSprint, error } = await supabase
      .from('sprints')
      .insert([
        {
          child_id: childId,
          name: newSprintName.trim(),
          goal: newSprintGoal.trim() || null,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating sprint:', error)
      return
    }

    // Переносим невыполненные задачи если нужно
    if (moveTasks && oldSprintId && newSprint) {
      await supabase
        .from('tasks')
        .update({ sprint_id: newSprint.id })
        .eq('sprint_id', oldSprintId)
        .eq('is_completed', false)
    }

    setNewSprintName('')
    setNewSprintGoal('')
    setShowCreateSprint(false)
    setMoveTasks(true) // Сброс на default
    onUpdate()
    }
  }

  const completeSprint = async (sprint: Sprint) => {
    setSprintToComplete(sprint)
    setShowCompletionModal(true)
  }

  const handleSprintCompleted = () => {
    setShowCompletionModal(false)
    setSprintToComplete(null)
    onUpdate()
  }

  const startEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint)
    setEditName(sprint.name)
    setEditGoal(sprint.goal || '')
  }

  const cancelEdit = () => {
    setEditingSprint(null)
    setEditName('')
    setEditGoal('')
  }

  const saveSprint = async () => {
    if (!editingSprint || !editName.trim()) return

    const { error } = await supabase
      .from('sprints')
      .update({
        name: editName.trim(),
        goal: editGoal.trim() || null,
      })
      .eq('id', editingSprint.id)

    if (!error) {
      setEditingSprint(null)
      setEditName('')
      setEditGoal('')
      onUpdate()
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Спринты</h2>
          
          {/* Вкладки */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('sprints')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'sprints'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎯 Спринты
            </button>
            <button
              onClick={() => setActiveTab('retrospectives')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'retrospectives'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Ретро
            </button>
          </div>
        </div>
        
        {activeTab === 'sprints' && (
          <button
            onClick={() => setShowCreateSprint(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
          >
            + Создать спринт
          </button>
        )}
      </div>

      {/* Контент вкладок */}
      {activeTab === 'sprints' ? (
        <>
          {/* Активный спринт */}
          {activeSprint ? (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 sm:p-6 mb-6">
          {editingSprint?.id === activeSprint.id ? (
            /* Форма редактирования */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название спринта
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
                  placeholder="Название спринта"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цель спринта
                </label>
                <textarea
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Цель спринта (необязательно)"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveSprint}
                  disabled={!editName.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сохранить
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            /* Отображение спринта */
            <>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 break-words">
                    🎯 {activeSprint.name}
                  </h3>
                  {activeSprint.goal && (
                    <p className="text-sm sm:text-base text-gray-600 break-words">
                      {activeSprint.goal}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEditSprint(activeSprint)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-md"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => completeSprint(activeSprint)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
                  >
                    ✓ Завершить спринт
                  </button>
                </div>
              </div>

              {/* Таймер обратного отсчёта */}
              <div className="mt-4">
                <SprintCountdown endDate={activeSprint.end_date} />
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Начало</div>
                  <div className="text-sm sm:text-base font-semibold text-gray-800">
                    {new Date(activeSprint.start_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xs sm:text-sm text-gray-600 mb-1">Окончание</div>
                  <div className="text-sm sm:text-base font-semibold text-gray-800">
                    {new Date(activeSprint.end_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4 shadow-sm border-2 border-yellow-200">
                  <div className="text-xs sm:text-sm text-yellow-700 mb-1 font-medium">Баллы</div>
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600 flex items-center gap-1">
                    {sprintPoints}
                    <span className="text-base">⭐</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-base sm:text-lg mb-4">Нет активного спринта</p>
          <button
            onClick={() => setShowCreateSprint(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            {completedSprints.length > 0 ? 'Создать новый спринт' : 'Создать первый спринт'}
          </button>
        </div>
      )}

      {/* История спринтов */}
      {completedSprints.length > 0 && (
        <div className="mt-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-4">
            История ({completedSprints.length})
          </h3>
          <div className="space-y-3">
            {completedSprints.slice(0, 3).map(sprint => (
              <div
                key={sprint.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                      {sprint.name}
                    </h4>
                    {sprint.goal && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {sprint.goal}
                      </p>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                    {new Date(sprint.start_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                    {' → '}
                    {new Date(sprint.end_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        </>
      ) : (
        /* Вкладка Ретроспективы */
        <RetrospectivesView childId={childId} />
      )}

      {/* Модальное окно завершения спринта */}
      {showCompletionModal && sprintToComplete && (
        <SprintCompletionModal
          sprint={sprintToComplete}
          onClose={() => {
            setShowCompletionModal(false)
            setSprintToComplete(null)
          }}
          onComplete={handleSprintCompleted}
        />
      )}

      {/* Модальное окно создания спринта */}
      {showCreateSprint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateSprint(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Создать спринт
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название спринта
                </label>
                <input
                  type="text"
                  placeholder="Например: Неделя 1"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createSprint()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цель спринта (необязательно)
                </label>
                <textarea
                  placeholder="Что нужно достичь за эту неделю?"
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              
              {/* Чекбокс переноса задач (только если есть активный спринт) */}
              {activeSprint && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveTasks}
                      onChange={(e) => setMoveTasks(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <div className="font-medium text-purple-900 mb-1">
                        📦 Перенести невыполненные задачи
                      </div>
                      <div className="text-xs text-purple-700">
                        Задачи из текущего спринта, которые не были выполнены, автоматически переместятся в новый спринт
                      </div>
                    </div>
                  </label>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-700">
                  ℹ️ Спринт автоматически создаётся на 7 дней
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateSprint(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={createSprint}
                disabled={!newSprintName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
