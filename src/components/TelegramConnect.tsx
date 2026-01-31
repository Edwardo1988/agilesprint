// src/components/TelegramConnect.tsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface TelegramConnectProps {
  parentId: string
}

export default function TelegramConnect({ parentId }: TelegramConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCode, setLinkCode] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkConnection()
    generateLinkCode()
  }, [parentId])

  // Закрывать меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const checkConnection = async () => {
    const { data, error } = await supabase
      .from('user_telegram')
      .select('username')
      .eq('user_id', parentId)
      .single()

    if (data) {
      setIsConnected(true)
      setTelegramUsername(data.username)
    }
    setLoading(false)
  }

  const generateLinkCode = async () => {
    const { data } = await supabase
      .from('parents')
      .select('access_code, id')
      .eq('id', parentId)
      .single()

    if (data?.access_code) {
      setLinkCode(data.access_code)
    } else {
      setLinkCode(parentId.substring(0, 8))
    }
  }

  const disconnect = async () => {
    const { error } = await supabase
      .from('user_telegram')
      .delete()
      .eq('user_id', parentId)

    if (!error) {
      setIsConnected(false)
      setTelegramUsername(null)
      setIsOpen(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkCode)
    alert('Код скопирован! 📋')
  }

  if (loading) {
    return (
      <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md border-2 border-gray-200">
        <span className="text-sm text-gray-500">Загрузка...</span>
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Кнопка в шапке */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md border-2 transition-all ${
          isConnected
            ? 'bg-green-50 border-green-300 hover:bg-green-100'
            : 'bg-white border-purple-200 hover:bg-purple-50'
        }`}
      >
        <span className="text-xl">📱</span>
        {isConnected ? (
          <span className="text-sm font-medium text-green-700">✓ Подключен</span>
        ) : (
          <span className="text-sm font-medium text-gray-700">Telegram</span>
        )}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown меню - выпадает влево и вниз */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 z-50 overflow-hidden">
          {isConnected ? (
            <div className="p-5">
              {/* Заголовок */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-bold text-gray-800">Подключено</h3>
                </div>
                {telegramUsername && (
                  <p className="text-sm text-gray-600">@{telegramUsername}</p>
                )}
              </div>

              {/* Информация об уведомлениях */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 font-medium mb-2">
                  Вы получаете:
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span>🌅</span>
                    <span>Утро: 09:00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🌙</span>
                    <span>Вечер: 20:00</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Завершение спринтов</span>
                  </li>
                </ul>
              </div>

              {/* Кнопка отключения */}
              <button
                onClick={disconnect}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
              >
                Отключить уведомления
              </button>
            </div>
          ) : (
            <div className="p-5">
              {/* Заголовок */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📱</span>
                  <h3 className="text-lg font-bold text-gray-800">Telegram уведомления</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Получайте напоминания о задачах детей
                </p>
              </div>

              {/* Инструкция */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-blue-800 font-medium mb-2">Шаг 1: Откройте бота</p>
                    <a
                      href="https://t.me/agilefamilybot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-center font-medium transition-all"
                    >
                      🤖 Открыть Telegram бота
                    </a>
                  </div>

                  <div>
                    <p className="text-blue-800 font-medium mb-1">Шаг 2: Отправьте /start</p>
                  </div>

                  <div>
                    <p className="text-blue-800 font-medium mb-2">Шаг 3: Введите код</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded-lg font-mono text-base font-bold text-blue-900 border-2 border-blue-300 text-center">
                        {linkCode}
                      </code>
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-all font-medium"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Подсказка */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  💡 После подключения будете получать утренние напоминания (09:00) и вечерние итоги (20:00)
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
