import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import AchievementsBadge from './AchievementsBadge'

type Child = Database['public']['Tables']['children']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface ChildPageProps {
  accessCode: string
}

// Коллекция нативных эмодзи (Unicode)
const EMOJI_COLLECTION = [
  // Смайлики и эмоции
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  
  // Животные
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎',
  '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟',
  
  // Еда и напитки
  '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
  '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
  '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞',
  '🥖', '🥨', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖',
  '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘',
  
  // Предметы и символы
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🥊',
  '🥋', '🎽', '⛸', '🥌', '🛷', '🎿', '⛷', '🏂', '🏋', '🤼',
  '🎮', '🕹', '🎲', '🎯', '🎪', '🎨', '🎬', '🎤', '🎧', '🎼',
  '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎭', '🎪', '🎨', '🎬',
  
  // Природа и погода
  '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌼', '🌵', '🌲', '🌳',
  '🌴', '🌱', '🌿', '☘', '🍀', '🍁', '🍂', '🍃', '🌾', '🌺',
  '⭐', '🌟', '✨', '⚡', '☄', '💥', '🔥', '🌈', '☀', '🌤',
  '⛅', '🌥', '☁', '🌦', '🌧', '⛈', '🌩', '🌨', '❄', '☃',
  
  // Сердечки и символы
  '❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮',
  '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐',
  '⚛', '🔮', '🎊', '🎉', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
]

export default function ChildPage({ accessCode }: ChildPageProps) {
  const [child, setChild] = useState<Child | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (!accessCode) {
      console.error('No access code provided')
      setLoading(false)
      return
    }

    console.log('Loading child data for access code:', accessCode)
    loadChildData()
  }, [accessCode])

  const loadChildData = async () => {
    if (!accessCode) {
      console.error('loadChildData called without accessCode')
      return
    }

    console.log('Starting loadChildData...')
    setLoading(true)
    
    try {
      // Загрузить данные ребёнка по коду доступа
      console.log('Fetching child with access code:', accessCode)
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('access_code', accessCode)
        .single()

      if (childError) {
        console.error('Error loading child:', childError)
        setLoading(false)
        return
      }

      if (!childData) {
        console.error('No child found with this access code')
        setLoading(false)
        return
      }

      console.log('Child loaded:', childData)
      setChild(childData)

    // Загрузить активный спринт (может не быть, это нормально)
    const { data: sprintData, error: sprintError } = await supabase
      .from('sprints')
      .select('*')
      .eq('child_id', childData.id)
      .eq('is_active', true)
      .maybeSingle()

    if (sprintError) {
      console.warn('Could not load sprint (table may not exist):', sprintError)
      // Это не критично - спринты опциональны
    } else {
      setActiveSprint(sprintData)
    }

    // Загрузить задачи
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('child_id', childData.id)
      .order('created_at', { ascending: false })

    if (tasksError) {
      console.error('Error loading tasks:', tasksError)
    } else {
      setTasks(tasksData || [])
    }

    setLoading(false)
    } catch (error) {
      console.error('Unexpected error in loadChildData:', error)
      setLoading(false)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!child) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newStatus = !currentStatus
    const pointsChange = newStatus ? task.points : -task.points

    // Оптимистичное обновление UI
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === taskId ? { ...t, is_completed: newStatus } : t
      )
    )
    setChild(prev => 
      prev ? { ...prev, total_points: prev.total_points + pointsChange } : null
    )

    // Обновить статус задачи в БД
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ is_completed: newStatus })
      .eq('id', taskId)

    if (taskError) {
      console.error('Error updating task:', taskError)
      // Откатить изменения при ошибке
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId ? { ...t, is_completed: currentStatus } : t
        )
      )
      setChild(prev => 
        prev ? { ...prev, total_points: prev.total_points - pointsChange } : null
      )
      return
    }

    // Обновить баллы ребёнка в БД
    const { error: childError } = await supabase
      .from('children')
      .update({ total_points: child.total_points + pointsChange })
      .eq('id', child.id)

    if (childError) {
      console.error('Error updating points:', childError)
      // Перезагрузить данные при ошибке
      loadChildData()
      return
    }

    // Если это экземпляр регулярной задачи и он только что выполнен
    if (newStatus && task.parent_task_id) {
      await createNextRecurringInstance(task)
    }
  }

  const createNextRecurringInstance = async (completedTask: Task) => {
    if (!completedTask.parent_task_id) return

    // Загрузить родительскую задачу
    const { data: parentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', completedTask.parent_task_id)
      .single()

    if (!parentTask || !parentTask.recurrence_pattern) return

    // Проверить нужно ли создавать задачу на завтра
    const shouldCreate = shouldCreateTaskForTomorrow(parentTask.recurrence_pattern)
    
    if (shouldCreate) {
      // Создать дату на завтра
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      // Создать новый экземпляр
      const newInstance = {
        child_id: completedTask.child_id,
        title: completedTask.title,
        description: completedTask.description,
        points: completedTask.points,
        is_completed: false,
        is_recurring: false,
        parent_task_id: parentTask.id,
        sprint_id: completedTask.sprint_id,
        created_at: tomorrow.toISOString(), // Устанавливаем на завтра
        original_date: tomorrow.toISOString(), // Изначально планируется на завтра
      }

      const { error } = await supabase
        .from('tasks')
        .insert([newInstance])

      if (!error) {
        // Перезагрузить данные чтобы показать новый экземпляр
        loadChildData()
      }
    }
  }

  const shouldCreateTaskForTomorrow = (pattern: string): boolean => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayOfWeek = tomorrow.getDay() // 0 = Sunday, 6 = Saturday
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const tomorrowDay = dayNames[dayOfWeek]

    if (pattern === 'daily') return true
    if (pattern === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5
    if (pattern === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6
    
    // Custom days (comma-separated)
    const days = pattern.split(',')
    return days.includes(tomorrowDay)
  }

  const updateAvatar = async (emoji: string) => {
    if (!child) return

    const { error } = await supabase
      .from('children')
      .update({ avatar_emoji: emoji })
      .eq('id', child.id)

    if (!error) {
      setChild(prev => prev ? { ...prev, avatar_emoji: emoji } : null)
      setShowEmojiPicker(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Ребёнок не найден</p>
        </div>
      </div>
    )
  }

  // Фильтруем задачи: не показываем родительские шаблоны (is_recurring = true)
  // И показываем только задачи на сегодня
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const visibleTasks = tasks.filter(t => {
    if (t.is_recurring) return false // Не показываем шаблоны
    
    // Проверяем дату создания задачи
    const taskDate = new Date(t.created_at)
    taskDate.setHours(0, 0, 0, 0)
    
    // Показываем только задачи созданные сегодня или раньше, но не завтрашние
    return taskDate <= today
  })
  
  const completedTasks = visibleTasks.filter(t => t.is_completed)
  const sprintTasks = visibleTasks.filter(t => t.sprint_id === activeSprint?.id)
  const completedSprintTasks = sprintTasks.filter(t => t.is_completed)
  const otherTasks = visibleTasks.filter(t => !t.sprint_id || t.sprint_id !== activeSprint?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Шапка с аватаром */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Аватар с возможностью смены */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => setShowEmojiPicker(true)}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-lg transition-transform group-hover:scale-105">
                {child.avatar_emoji || child.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all">
                <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Изменить
                </span>
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Привет, {child.name}! 👋
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Твои задачи и достижения
              </p>
            </div>

            {/* Статистика */}
            <div className="flex gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl p-3 sm:p-4 text-center shadow-lg min-w-[80px] sm:min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">{child.total_points}</div>
                <div className="text-xs sm:text-sm text-white opacity-90">Баллов</div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl p-3 sm:p-4 text-center shadow-lg min-w-[80px] sm:min-w-[100px]">
                <div className="text-2xl sm:text-3xl font-bold text-white">{completedTasks.length}</div>
                <div className="text-xs sm:text-sm text-white opacity-90">Выполнено</div>
              </div>
            </div>
          </div>
        </div>

        {/* Достижения */}
        <AchievementsBadge 
          tasks={tasks} 
          totalPoints={child.total_points} 
          activeSprint={activeSprint}
        />

        {/* Активный спринт */}
        {activeSprint && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🎯</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                  {activeSprint.name}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {activeSprint.goal}
                </p>
              </div>
            </div>

            {/* Прогресс спринта */}
            <div className="bg-gray-100 rounded-xl p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <span className="text-sm sm:text-base font-medium text-gray-700">
                  Прогресс: {completedSprintTasks.length} из {sprintTasks.length}
                </span>
                <span className="text-sm sm:text-base font-bold text-purple-600">
                  {sprintTasks.length > 0 
                    ? Math.round((completedSprintTasks.length / sprintTasks.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${sprintTasks.length > 0 
                      ? (completedSprintTasks.length / sprintTasks.length) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Даты */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Начало: {new Date(activeSprint.start_date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏁</span>
                <span>Конец: {new Date(activeSprint.end_date).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Задачи спринта */}
        {activeSprint && sprintTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Задачи спринта
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {sprintTasks.filter(t => !t.is_completed).map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}

        {/* Другие задачи */}
        {otherTasks.filter(t => !t.is_completed).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Другие задачи
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {otherTasks.filter(t => !t.is_completed).map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}

        {/* Выполненные задачи */}
        {completedTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Выполнено ({completedTasks.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно выбора эмодзи */}
      {showEmojiPicker && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowEmojiPicker(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Выбери свой аватар 😊
                </h3>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Сетка эмодзи */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 sm:gap-3">
                {EMOJI_COLLECTION.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => updateAvatar(emoji)}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl hover:bg-gray-100 rounded-lg transition-all hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Компонент карточки задачи
function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string, status: boolean) => void }) {
  return (
    <div
      onClick={() => onToggle(task.id, task.is_completed)}
      style={{ pointerEvents: 'auto' }}
      className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
        task.is_completed
          ? 'bg-green-50 border-green-200 opacity-75'
          : 'bg-white border-gray-200 hover:border-purple-300'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Чекбокс */}
        <div className="flex-shrink-0 pt-1">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              task.is_completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-purple-500'
            }`}
          >
            {task.is_completed && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-base sm:text-lg break-words ${
            task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm sm:text-base mt-1 break-words ${
              task.is_completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
        </div>

        {/* Баллы */}
        <div className="flex-shrink-0">
          <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-base ${
            task.is_completed
              ? 'bg-green-200 text-green-700'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
          }`}>
            {task.points} ⭐
          </div>
        </div>
      </div>
    </div>
  )
}
