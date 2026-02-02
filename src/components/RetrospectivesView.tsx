// src/components/RetrospectivesView.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Sprint = Database['public']['Tables']['sprints']['Row']
type Retrospective = Database['public']['Tables']['sprint_retrospectives']['Row']

interface SprintWithRetro extends Sprint {
  retrospective?: Retrospective
}

interface RetrospectivesViewProps {
  childId: string
}

export default function RetrospectivesView({ childId }: RetrospectivesViewProps) {
  const [sprints, setSprints] = useState<SprintWithRetro[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRetro, setSelectedRetro] = useState<Retrospective | null>(null)

  useEffect(() => {
    loadRetrospectives()
  }, [childId])

  const loadRetrospectives = async () => {
    setLoading(true)

    // Получаем завершённые спринты
    const { data: sprintsData, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .eq('child_id', childId)
      .eq('is_active', false)
      .order('end_date', { ascending: false })

    if (sprintsError) {
      console.error('Error loading sprints:', sprintsError)
      setLoading(false)
      return
    }

    // Получаем ретроспективы для каждого спринта
    const sprintsWithRetro: SprintWithRetro[] = []

    for (const sprint of sprintsData || []) {
      const { data: retro } = await supabase
        .from('sprint_retrospectives')
        .select('*')
        .eq('sprint_id', sprint.id)
        .single()

      sprintsWithRetro.push({
        ...sprint,
        retrospective: retro || undefined
      })
    }

    setSprints(sprintsWithRetro)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка ретроспектив...</p>
      </div>
    )
  }

  if (sprints.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-500 text-lg">Ещё нет завершённых спринтов</p>
        <p className="text-gray-400 text-sm mt-2">
          После завершения первого спринта здесь появится ретроспектива
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sprints.map(sprint => {
        const retro = sprint.retrospective
        const hasRetro = retro && (retro.what_went_well || retro.what_to_improve || retro.action_items)

        return (
          <div
            key={sprint.id}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-purple-300 transition-all"
          >
            {/* Заголовок спринта */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {sprint.name}
                </h3>
                {sprint.goal && (
                  <p className="text-sm text-gray-600 mb-2">{sprint.goal}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>📅</span>
                  <span>
                    {new Date(sprint.start_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                    {' → '}
                    {new Date(sprint.end_date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
              </div>

              {/* Статистика */}
              {retro && (
                <div className="flex gap-2">
                  <div className="bg-purple-100 rounded-lg px-3 py-2 text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {retro.completion_percentage}%
                    </div>
                    <div className="text-xs text-purple-700">Выполнено</div>
                  </div>
                  <div className="bg-green-100 rounded-lg px-3 py-2 text-center">
                    <div className="text-xl font-bold text-green-600">
                      {retro.tasks_completed}/{retro.tasks_total}
                    </div>
                    <div className="text-xs text-green-700">Задачи</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg px-3 py-2 text-center">
                    <div className="text-xl font-bold text-yellow-600">
                      {retro.points_earned}
                    </div>
                    <div className="text-xs text-yellow-700">Баллы ⭐</div>
                  </div>
                </div>
              )}
            </div>

            {/* Ретроспектива */}
            {hasRetro ? (
              <div className="space-y-3 mt-4 pt-4 border-t-2 border-gray-100">
                {retro.what_went_well && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">✅</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-green-700 mb-1">
                          Что прошло хорошо
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {retro.what_went_well}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {retro.what_to_improve && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">🔧</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-orange-700 mb-1">
                          Что можно улучшить
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {retro.what_to_improve}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {retro.action_items && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">🚀</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-blue-700 mb-1">
                          Действия на следующий спринт
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {retro.action_items}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                <p className="text-sm text-gray-400 italic text-center py-4">
                  Ретроспектива не была заполнена
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
