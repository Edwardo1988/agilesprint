// src/components/TelegramConnect.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface TelegramConnectProps {
  parentId: string
}

export default function TelegramConnect({ parentId }: TelegramConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCode, setLinkCode] = useState('')

  useEffect(() => {
    checkConnection()
    generateLinkCode()
  }, [parentId])

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
    // Получаем access_code из таблицы parents
    const { data } = await supabase
      .from('parents')
      .select('access_code, id')
      .eq('id', parentId)
      .single()

    if (data?.access_code) {
      setLinkCode(data.access_code)
    } else {
      // Если нет access_code, используем первые 8 символов UUID
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
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkCode)
    alert('Код скопирован! 📋')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-3xl">📱</span>
        Уведомления в Telegram
      </h2>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-800">Подключено</p>
                {telegramUsername && (
                  <p className="text-sm text-green-600">@{telegramUsername}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2 font-semibold">
              Вы будете получать:
            </p>
            <ul className="text-sm text-blue-600 space-y-1">
              <li className="flex items-center gap-2">
                <span>🌅</span>
                <span>Утренние напоминания о задачах (09:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🌙</span>
                <span>Вечерние итоги дня (20:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>Напоминания о важных задачах</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🏆</span>
                <span>Уведомления о завершении спринтов</span>
              </li>
            </ul>
          </div>

          <button
            onClick={disconnect}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
          >
            Отключить уведомления
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <p className="text-blue-800 mb-4 font-medium">
              Подключите Telegram бот для получения уведомлений о задачах и прогрессе детей
            </p>
            
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[60px]">Шаг 1:</span>
                <span>Откройте бота в Telegram</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[60px]">Шаг 2:</span>
                <span>Нажмите /start</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[60px]">Шаг 3:</span>
                <div className="flex-1">
                  <span>Введите код привязки:</span>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="bg-white px-4 py-2 rounded-lg font-mono text-lg font-bold text-blue-900 border-2 border-blue-300">
                      {linkCode}
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-all text-xs font-medium"
                    >
                      📋 Копировать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a
            href="https://t.me/agilesprint_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-center transition-all shadow-md hover:shadow-lg"
          >
            🤖 Открыть Telegram бот
          </a>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-base">💡</span>
              <span>
                <strong>Совет:</strong> После подключения вы будете получать утренние напоминания в 09:00 и вечерние итоги в 20:00. Время можно будет настроить позже.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
