// src/components/Header.jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Header() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // В будущем этот стейт можно заменить на проверку реального пользователя (например, через хук или контекст)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleTestLogin = () => {
    setIsAuthenticated(true);
    setIsAuthOpen(false);
  };

  const handleLogout = async () => {
    try {
      // TODO: В будущем здесь будет запрос к бэкенду для уничтожения сессии
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Ошибка при выходе из системы:', err);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-black dark:text-white hover:text-blue-600 transition">
            Блог
          </Link>

          <nav className="flex items-center gap-4">
            {/* Кнопка "Новый пост" — только для авторизованных */}
            {isAuthenticated && (
              <Link
                href="/blog/create"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Новый пост
              </Link>
            )}

            {/* Кнопка "Войти" — только для неавторизованных */}
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Войти
              </button>
            )}

            {/* Аватар + кнопка "Выйти" — для авторизованных */}
            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                  A
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Выйти
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onTestLogin={handleTestLogin}
      />
    </>
  );
}