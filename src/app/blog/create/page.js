// src/app/blog/create/page.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Ограничения для безопасности и производительности
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function CreatePost() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  // Рефы для работы с файлом и текстовым полем
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    image: null,
  });

  // Авто-генерация slug из заголовка
  useEffect(() => {
    if (formData.title) {
      const cleanTitle = formData.title
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Zа-яА-Я0-9_]/g, '')
        .toLowerCase();
      
      const randomId = Math.random().toString(36).substring(2, 8);
      const slug = cleanTitle ? `${cleanTitle}_${randomId}` : `post_${randomId}`;
      
      setFormData(prev => ({ ...prev, slug }));
    } else {
      const randomId = Math.random().toString(36).substring(2, 8);
      setFormData(prev => ({ ...prev, slug: `post_${randomId}` }));
    }
  }, [formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Базовая валидация перед отправкой
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Заголовок и содержание обязательны для заполнения.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Если используете JWT-токен, его можно передать здесь:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании поста');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла
    if (file.size > MAX_FILE_SIZE) {
      setError('Файл слишком большой. Максимальный размер — 5 МБ.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Проверка типа файла
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Неподдерживаемый формат. Используйте JPG, PNG, WEBP или GIF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    const newText = before + prefix + selectedText + suffix + after;
    
    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col px-4 py-8 bg-white dark:bg-black">
        <div className="flex items-center gap-4 mb-8 border-b pb-4 border-gray-200 dark:border-gray-800">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            ← Назад
          </Link>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Создать пост
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
          {/* Заголовок */}
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
              maxLength={150}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите заголовок"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL (slug)
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Будет доступно по адресу: /blog/{formData.slug || '...'}
            </p>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={300}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Краткое описание"
            />
          </div>

          {/* Изображение */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Изображение (до 5 МБ)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Удалить
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Превью"
                  className="max-h-48 rounded-lg border border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          {/* Содержание */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Содержание *
            </label>
            
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Жирный текст"
              >
                <b>B</b>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Курсив"
              >
                <i>I</i>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('# ', '')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Заголовок"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('## ', '')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Подзаголовок"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('```\n', '\n```')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Код"
              >
                {'<>'}
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ', '')}
                className="px-3 py-1 text-sm font-bold bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Список"
              >
                • list
              </button>
            </div>

            <textarea
              ref={textareaRef}
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={12}
              maxLength={20000}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Ваш текст... Поддерживается Markdown"
            />
          </div>

          {/* Кнопки отправки */}
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