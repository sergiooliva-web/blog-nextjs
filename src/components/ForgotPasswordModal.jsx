// src/components/ForgotPasswordModal.jsx
'use client';

import { useState } from 'react';

export default function ForgotPasswordModal({ isOpen, onClose, onBack }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось отправить запрос.');
      }

      setIsSent(true);
    } catch (err) {
      setError(err.message || 'Сервер недоступен. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-black rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">
            Восстановление пароля
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {isSent ? (
          <div>
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                Инструкции отправлены
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Мы отправили ссылку для сброса пароля на {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setEmail('');
                onBack();
                onClose();
              }}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться ко входу
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Введите ваш email, и мы отправим инструкции по восстановлению пароля.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 bg-blue-600 text-white font-semibold rounded-lg transition-colors ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Отправка...' : 'Отправить инструкции'}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBack();
              }}
              className="w-full py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Назад ко входу
            </button>
          </form>
        )}
      </div>
    </div>
  );
}