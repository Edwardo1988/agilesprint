import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import SprintManager from './SprintManager'

type Child = Database['public']['Tables']['children']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface ParentDashboardProps {
  parentId: string
  accessCode: string
}

// Коллекция стартовых эмодзи для случайного выбора при создании ребёнка
const STARTER_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😋', '😛', '🤗', '🤔', '🤪', '😎', '🤓', '🥳', '😺',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🌟', '⭐', '✨', '🎉',
  '🎈', '🎁', '🏆', '🥇', '🎯', '🚀', '🌈', '🌸', '🌺', '🌻',
]

export default function ParentDashboard({ parentId, accessCode }: ParentDashboardProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Форма добавления ребёнка
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  
  // Форма добавления задачи
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPoints, setNewTaskPoints] = useState(10)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState('daily')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  
  // Модальное окно кода доступа
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)
  const [selectedChildForCode, setSelectedChildForCode] = useState<Child | null>(null)
  const [emailAddress, setEmailAddress] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id)
    }
  }, [children])

  const loadDashboardData = async () => {
    setLoading(true)

    // Загрузить детей этого родителя
    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (childrenError) {
      console.error('Error loading children:', childrenError)
    } else {
      setChildren(childrenData || [])
    }

    // Загрузить все задачи
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Error loading tasks:', tasksError)
    } else {
      setTasks(tasksData || [])
    }

    // Загрузить все спринты
    const { data: sprintsData, error: sprintsError } = await supabase
      .from('sprints')
      .select('*')
      .order('created_at', { ascending: false })

    if (sprintsError) {
      console.error('Error loading sprints:', sprintsError)
    } else {
      setSprints(sprintsData || [])
    }

    setLoading(false)
  }

  const addChild = async () => {
    if (!newChildName.trim()) return

    // Выбрать случайный эмодзи
    const randomEmoji = STARTER_EMOJIS[Math.floor(Math.random() * STARTER_EMOJIS.length)]
    
    // Генерировать уникальный код доступа
    const generateAccessCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const { data, error } = await supabase
      .from('children')
      .insert([
        {
          parent_id: parentId,
          name: newChildName.trim(),
          avatar_emoji: randomEmoji,
          access_code: generateAccessCode(),
          total_points: 0,
        }
      ])
      .select()
      .single()

    if (!error && data) {
      // Оптимистичное обновление UI - добавляем ребёнка в список
      setChildren(prevChildren => [...prevChildren, data])
      
      // Очистить форму
      setNewChildName('')
      setShowAddChild(false)
      
      // Автоматически выбрать нового ребёнка
      setSelectedChild(data.id)
    } else if (error) {
      console.error('Error adding child:', error)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedChild) return

    // Найти активный спринт для выбранного ребёнка
    const activeSprint = sprints.find(s => s.child_id === selectedChild && s.is_active)

    // Подготовить паттерн повторения
    let finalRecurrencePattern = null
    if (isRecurring) {
      if (recurrencePattern === 'custom' && selectedDays.length > 0) {
        finalRecurrencePattern = selectedDays.join(',')
      } else if (recurrencePattern !== 'custom') {
        finalRecurrencePattern = recurrencePattern
      }
    }

    const newTask = {
      child_id: selectedChild,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || null,
      points: newTaskPoints,
      is_completed: false,
      is_recurring: isRecurring,
      recurrence_pattern: finalRecurrencePattern,
      sprint_id: activeSprint?.id || null,
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single()

    if (!error && data) {
      // Если это регулярная задача, создать первый экземпляр
      if (isRecurring && finalRecurrencePattern) {
        await createTaskInstance(data)
      } else {
        // Обычная задача - добавляем в список
        setTasks(prevTasks => [data, ...prevTasks])
      }
      
      // Очистить форму
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPoints(10)
      setIsRecurring(false)
      setRecurrencePattern('daily')
      setSelectedDays([])
      
      // Перезагрузить данные чтобы увидеть экземпляры
      loadDashboardData()
    } else if (error) {
      console.error('Error adding task:', error)
    }
  }

  const createTaskInstance = async (parentTask: Task) => {
    // Создать экземпляр задачи на сегодня
    const instance = {
      child_id: parentTask.child_id,
      title: parentTask.title,
      description: parentTask.description,
      points: parentTask.points,
      is_completed: false,
      is_recurring: false,
      parent_task_id: parentTask.id,
      sprint_id: parentTask.sprint_id,
    }

    const { error } = await supabase
      .from('tasks')
      .insert([instance])

    if (error) {
      console.error('Error creating task instance:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    // Оптимистичное обновление UI - сразу удаляем из списка
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      // При ошибке перезагрузить данные чтобы восстановить корректное состояние
      loadDashboardData()
    }
  }

  const openAccessCodeModal = (child: Child) => {
    setSelectedChildForCode(child)
    setShowAccessCodeModal(true)
    setEmailAddress('')
    setEmailSent(false)
    setCopiedCode(false)
  }

  const closeAccessCodeModal = () => {
    setShowAccessCodeModal(false)
    setSelectedChildForCode(null)
    setEmailAddress('')
    setEmailSent(false)
    setCopiedCode(false)
  }

  const copyAccessCode = async () => {
    if (!selectedChildForCode) return
    
    try {
      const url = `${window.location.origin}/?child=${selectedChildForCode.access_code}`
      await navigator.clipboard.writeText(url)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const sendAccessCodeEmail = async () => {
    if (!selectedChildForCode || !emailAddress.trim()) return
    
    setSendingEmail(true)
    
    try {
      const url = `${window.location.origin}/?child=${selectedChildForCode.access_code}`
      const subject = `Код доступа AgileSprint для ${selectedChildForCode.name}`
      const body = `Привет!

Вот твоя персональная страница в AgileSprint:
${url}

Открой эту ссылку чтобы увидеть свои задачи и достижения!

Имя: ${selectedChildForCode.name}
Код доступа: ${selectedChildForCode.access_code}

Удачи! 🚀`
      
      // Открываем почтовый клиент
      window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      
      setEmailSent(true)
      setTimeout(() => {
        closeAccessCodeModal()
      }, 2000)
    } catch (err) {
      console.error('Error sending email:', err)
    } finally {
      setSendingEmail(false)
    }
  }

  const selectedChildData = children.find(c => c.id === selectedChild)
  // Фильтруем: не показываем родительские шаблоны (is_recurring = true), только экземпляры
  const childTasks = tasks.filter(t => t.child_id === selectedChild && !t.is_recurring)
  const childSprints = sprints.filter(s => s.child_id === selectedChild)
  const activeSprint = childSprints.find(s => s.is_active)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            AgileSprint 🎯
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Управление задачами для ваших детей
          </p>
        </div>

        {/* Дети */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Дети</h2>
            <button
              onClick={() => setShowAddChild(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              + Добавить ребёнка
            </button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Добавьте первого ребёнка</p>
              <button
                onClick={() => setShowAddChild(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                + Добавить ребёнка
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map(child => (
                <div
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedChild === child.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg flex-shrink-0">
                      {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate">
                        {child.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {child.total_points} баллов
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <a
                          href={`/?child=${child.access_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Открыть страницу →
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openAccessCodeModal(child)
                          }}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          🔑 Код доступа
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Выпадающий список для мобильных */}
          {children.length > 0 && (
            <div className="mt-6 sm:hidden">
              <select
                value={selectedChild || ''}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.avatar_emoji || '👤'} {child.name} ({child.total_points} баллов)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Спринты */}
        {selectedChild && (
          <SprintManager
            childId={selectedChild}
            sprints={childSprints}
            onUpdate={loadDashboardData}
          />
        )}

        {/* Задачи */}
        {selectedChild && selectedChildData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
              Задачи для {selectedChildData.name}
            </h2>

            {/* Форма добавления задачи */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Добавить задачу</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Название задачи"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                />
                <textarea
                  placeholder="Описание (необязательно)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Баллы за выполнение
                    </label>
                    <input
                      type="number"
                      value={newTaskPoints}
                      onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addTask}
                      disabled={!newTaskTitle.trim()}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Добавить
                    </button>
                  </div>
                </div>

                {/* Настройки регулярных задач */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="font-medium text-gray-700">
                      🔄 Повторяющаяся задача
                    </span>
                  </label>

                  {isRecurring && (
                    <div className="mt-4 ml-7 space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Паттерн повторения
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="recurrence"
                              value="daily"
                              checked={recurrencePattern === 'daily'}
                              onChange={(e) => setRecurrencePattern(e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="text-gray-700">📅 Ежедневно</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="recurrence"
                              value="weekdays"
                              checked={recurrencePattern === 'weekdays'}
                              onChange={(e) => setRecurrencePattern(e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="text-gray-700">💼 По будням (пн-пт)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="recurrence"
                              value="weekends"
                              checked={recurrencePattern === 'weekends'}
                              onChange={(e) => setRecurrencePattern(e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="text-gray-700">🎉 Выходные (сб-вс)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="recurrence"
                              value="custom"
                              checked={recurrencePattern === 'custom'}
                              onChange={(e) => setRecurrencePattern(e.target.value)}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="text-gray-700">🎯 Выбранные дни</span>
                          </label>
                        </div>
                      </div>

                      {recurrencePattern === 'custom' && (
                        <div className="ml-6 animate-fadeIn">
                          <div className="flex flex-wrap gap-2">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, idx) => {
                              const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
                              const isSelected = selectedDays.includes(day)
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedDays(selectedDays.filter(d => d !== day))
                                    } else {
                                      setSelectedDays([...selectedDays, day])
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                    isSelected
                                      ? 'bg-purple-500 text-white shadow-md'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {dayNames[idx]}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        ℹ️ Регулярная задача будет автоматически создаваться для ребёнка по выбранному графику
                      </div>
                    </div>
                  )}
                </div>

                {activeSprint && (
                  <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    ℹ️ Задача будет автоматически добавлена в активный спринт "{activeSprint.name}"
                  </p>
                )}
              </div>
            </div>

            {/* Список задач */}
            {childTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Пока нет задач</p>
                <p className="text-sm mt-2">Добавьте первую задачу выше</p>
              </div>
            ) : (
              <div className="space-y-3">
                {childTasks.map(task => {
                  const taskSprint = sprints.find(s => s.id === task.sprint_id)
                  return (
                    <div
                      key={task.id}
                      className={`p-4 sm:p-5 rounded-xl border-2 ${
                        task.is_completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className={`font-semibold text-base sm:text-lg break-words ${
                              task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
                            }`}>
                              {task.title}
                            </h3>
                            {taskSprint && (
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium self-start">
                                🎯 {taskSprint.name}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className={`text-sm sm:text-base break-words ${
                              task.is_completed ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-base ${
                            task.is_completed
                              ? 'bg-green-200 text-green-700'
                              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          }`}>
                            {task.points} ⭐
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно добавления ребёнка */}
      {showAddChild && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddChild(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Добавить ребёнка
            </h3>
            <input
              type="text"
              placeholder="Имя ребёнка"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addChild()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddChild(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={addChild}
                disabled={!newChildName.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно кода доступа */}
      {showAccessCodeModal && selectedChildForCode && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeAccessCodeModal}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white relative">
              <button
                onClick={closeAccessCodeModal}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="text-5xl mb-3">🔑</div>
                <h3 className="text-2xl font-bold mb-2">
                  Код доступа
                </h3>
                <p className="text-white text-opacity-90">
                  для {selectedChildForCode.name}
                </p>
              </div>
            </div>

            {/* Контент */}
            <div className="p-6">
              {/* Код доступа */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код доступа:
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-mono text-2xl font-bold text-center text-purple-600 border-2 border-gray-200">
                    {selectedChildForCode.access_code}
                  </div>
                  <button
                    onClick={copyAccessCode}
                    className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                  >
                    {copiedCode ? '✓' : '📋'}
                  </button>
                </div>
                {copiedCode && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✓ Ссылка скопирована!
                  </p>
                )}
              </div>

              {/* Ссылка */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ссылка для ребёнка:
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-600 break-all border border-gray-200">
                  {window.location.origin}/?child={selectedChildForCode.access_code}
                </div>
              </div>

              {/* Email форма */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Отправить на email:
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={sendAccessCodeEmail}
                    disabled={!emailAddress.trim() || sendingEmail}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingEmail ? '...' : '📧'}
                  </button>
                </div>
                {emailSent && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    ✓ Почтовый клиент открыт!
                  </p>
                )}
              </div>

              {/* Инструкция */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-2">💡 Как поделиться:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Скопируйте ссылку кнопкой 📋</li>
                  <li>Отправьте через мессенджер</li>
                  <li>Или используйте email ☝️</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
