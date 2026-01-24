import { useState } from 'react';
import { Users, LogIn, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onParentLogin: (accessCode: string) => void;
  onParentCreate: () => void;
}

export function LandingPage({ onParentLogin, onParentCreate }: LandingPageProps) {
  const [accessCode, setAccessCode] = useState('');

  const handleLogin = () => {
    if (accessCode.trim()) {
      onParentLogin(accessCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Семейные задачи</h1>
          <p className="text-xl text-gray-600">
            Помогите детям развивать ответственность через выполнение задач
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Новый родитель</h2>
            <p className="text-gray-600 mb-6">
              Создайте аккаунт и начните управлять задачами для своих детей
            </p>
            <button
              onClick={onParentCreate}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Создать аккаунт
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Есть аккаунт</h2>
            <p className="text-gray-600 mb-6">
              Введите свой код доступа чтобы продолжить работу
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Введите код доступа"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
              />
              <button
                onClick={handleLogin}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Войти
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Как это работает?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-blue-600">
                1
              </div>
              <p className="text-gray-700">Создайте профили для детей</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-purple-600">
                2
              </div>
              <p className="text-gray-700">Добавьте задачи и установите баллы</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-green-600">
                3
              </div>
              <p className="text-gray-700">Дети выполняют задачи и получают баллы</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
