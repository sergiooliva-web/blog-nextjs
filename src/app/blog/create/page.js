'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePost() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Валидация slug
      const slugValid = /^[a-z0-9-]+$/.test(formData.slug);
      if (!slugValid) {
        throw new Error('URL может содержать только строчные буквы, цифры и дефисы');
      }

      // Отправляем данные на серверный API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании поста');
      }

      // Успешно создано
      router.push('/');
      router.refresh(); // Обновляем данные на странице
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl mx-auto flex-col px-16 py-8 bg-white dark:bg-black">
        <div className="flex items-center gap-4 mb-8 border-b pb-4 border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ← Назад
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            ✏️ Создать пост
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Заголовок *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите заголовок"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL (slug) *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="hello-world"
            />
            <p className="text-sm text-gray-500 mt-1">
              Будет доступно по адресу: /blog/{formData.slug || '...'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Только строчные буквы, цифры и дефисы
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Краткое описание"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Содержание *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ваш текст..."
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg transition-colors ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Публикация...' : 'Опубликовать'}
            </button>
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Отмена
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}