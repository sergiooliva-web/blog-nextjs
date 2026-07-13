import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col px-16 py-8 bg-white dark:bg-black">
        {/* Заголовок и кнопка создания */}
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            📝 Блог
          </h1>
          <Link
            href="/blog/create"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Новый пост
          </Link>
        </div>

        {/* Список постов */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-xl">Пока нет постов</p>
              <Link 
                href="/blog/create" 
                className="mt-4 text-blue-600 hover:underline"
              >
                Создать первый пост →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <h2 className="text-xl font-semibold text-black dark:text-white group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {post.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400 dark:text-gray-500">
                    <span>📅 {post.date}</span>
                    <span>✍️ {post.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">
            ✍️ Делитесь своими мыслями
          </p>
        </div>
      </main>
    </div>
  );
}