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
  const [showDetails, setShowDetails] = useState(false)

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
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(linkCode)
    alert('Код скопирован! 📋')
  }

  if (loading) {
    return <div className="text-xs text-gray-500">Загрузка...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
          <span>📱</span>
          Telegram
        </p>
        {isConnected && (
          <span className="text-xs text-green-600 font-medium">✓ Подключен</span>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-2">
          {telegramUsername && (
            <p className="text-xs text-gray-600">@{telegramUsername}</p>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            {showDetails ? '▼ Скрыть' : '▶ Подробнее'}
          </button>
          
          {showDetails && (
            <div className="mt-2 space-y-2 text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-medium mb-1">Уведомления:</p>
                <ul className="text-blue-600 space-y-1">
                  <li>🌅 Утро (09:00)</li>
                  <li>🌙 Вечер (20:00)</li>
                  <li>🏆 Спринты</li>
                </ul>
              </div>
              <button
                onClick={disconnect}
                className="w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition-all"
              >
                Отключить
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Получайте напоминания о задачах
          </p>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
          >
            {showDetails ? '▼ Скрыть' : '▶ Подключить'}
          </button>
          
          {showDetails && (
            <div className="mt-2 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 mb-2">
                  <strong>1.</strong> Откройте бота
                </p>
                <a
                  href="https://t.me/agilefamilybot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-center transition-all mb-2"
                >
                  🤖 Открыть бота
                </a>
                <p className="text-xs text-blue-700 mb-1">
                  <strong>2.</strong> Отправьте /start
                </p>
                <p className="text-xs text-blue-700 mb-1">
                  <strong>3.</strong> Введите код:
                </p>
                <div className="flex items-center gap-1">
                  <code className="flex-1 bg-white px-2 py-1 rounded text-xs font-mono font-bold text-blue-900 border border-blue-300 text-center">
                    {linkCode}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded text-xs"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
