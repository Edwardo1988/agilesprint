import { useState } from 'react'
import type { Database } from '../lib/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type Sprint = Database['public']['Tables']['sprints']['Row']

interface CalendarViewProps {
  tasks: Task[]
  sprints: Sprint[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>
  onTaskClick: (task: Task) => void
}

export default function CalendarView({ tasks, sprints, onTaskUpdate, onTaskClick }: CalendarViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Понедельник
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // Генерируем дни текущей недели
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  // Часы для таймлайна (6:00 - 23:00)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)

  // Фильтруем задачи по дате
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => {
      if (task.is_recurring) return false // Скрываем шаблоны
      const taskDate = new Date(task.created_at).toISOString().split('T')[0]
      return taskDate === dateStr
    }).sort((a, b) => {
      const timeA = a.start_time || '09:00:00'
      const timeB = b.start_time || '09:00:00'
      return timeA.localeCompare(timeB)
    })
  }

  // Конвертируем время в позицию на таймлайне
  const getTimePosition = (time: string | null): number => {
    if (!time) return 3 * 60 // 09:00 по умолчанию (3 часа от 6:00)
    const [hours, minutes] = time.split(':').map(Number)
    return (hours - 6) * 60 + minutes // Минуты от 6:00
  }

  // Обработка drag & drop
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetDate: Date, targetTime?: string) => {
    e.preventDefault()
    if (!draggedTask) return

    const newDate = new Date(targetDate)
    newDate.setHours(0, 0, 0, 0)

    const updates: Partial<Task> = {
      created_at: newDate.toISOString(),
    }

    // Если дропнули на конкретное время
    if (targetTime) {
      updates.start_time = targetTime
    }

    // Обновляем original_date если нужно
    if (draggedTask.original_date) {
      const originalDate = new Date(draggedTask.original_date)
      originalDate.setHours(0, 0, 0, 0)
      if (originalDate.getTime() === newDate.getTime()) {
        updates.original_date = null // Сбрасываем если вернули на original
      }
    } else {
      updates.original_date = draggedTask.created_at // Сохраняем старую дату
    }

    await onTaskUpdate(draggedTask.id, updates)
    setDraggedTask(null)
  }

  const handleDropOnTime = async (e: React.DragEvent, date: Date, hour: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:00:00`
    await handleDrop(e, date, timeStr)
  }

  // Навигация по неделям
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }

  const goToToday = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Заголовок календаря */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">📅 Календарь задач</h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all font-medium"
            >
              Сегодня
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
            >
              →
            </button>
          </div>
        </div>
        <div className="text-sm opacity-90">
          {weekDays[0].toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - {weekDays[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Сетка календаря */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Заголовки дней */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-2 text-xs font-medium text-gray-500">Время</div>
            {weekDays.map((date, idx) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const tasksCount = getTasksForDate(date).length
              return (
                <div
                  key={idx}
                  className={`p-2 text-center ${isToday ? 'bg-blue-50' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, date)}
                >
                  <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {dayNames[idx]}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  {tasksCount > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {tasksCount} {tasksCount === 1 ? 'задача' : tasksCount < 5 ? 'задачи' : 'задач'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Таймлайн */}
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                {/* Время */}
                <div className="p-2 text-xs text-gray-500 font-medium border-r border-gray-200">
                  {hour}:00
                </div>

                {/* Ячейки для каждого дня */}
                {weekDays.map((date, dayIdx) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const tasksInHour = getTasksForDate(date).filter(task => {
                    const taskTime = task.start_time || '09:00:00'
                    const taskHour = parseInt(taskTime.split(':')[0])
                    return taskHour === hour
                  })

                  return (
                    <div
                      key={dayIdx}
                      className={`p-1 min-h-[60px] border-r border-gray-100 relative ${
                        isToday ? 'bg-blue-50 bg-opacity-30' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnTime(e, date, hour)}
                    >
                      {tasksInHour.map(task => {
                        const sprint = sprints.find(s => s.id === task.sprint_id)
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onClick={() => onTaskClick(task)}
                            className={`mb-1 p-2 rounded-lg text-xs cursor-move hover:shadow-md transition-all ${
                              task.is_completed
                                ? 'bg-green-100 border border-green-300 opacity-60'
                                : 'bg-white border-2 border-blue-300 shadow-sm'
                            }`}
                          >
                            <div className="font-semibold text-gray-800 truncate">
                              {task.title}
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-gray-600">
                                {task.start_time?.substring(0, 5) || '09:00'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                task.is_completed 
                                  ? 'bg-green-200 text-green-700'
                                  : 'bg-yellow-200 text-yellow-700'
                              }`}>
                                {task.points}⭐
                              </span>
                            </div>
                            {sprint && (
                              <div className="text-xs text-blue-600 mt-1 truncate">
                                🎯 {sprint.name}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Подсказка */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          💡 Перетаскивайте задачи на другие дни и времена для изменения расписания
        </p>
      </div>
    </div>
  )
}
