import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/repositories/posts_repository';

export const dynamic = 'force-dynamic';

// Генерируем статические страницы для всех постов
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col px-16 py-8 bg-white dark:bg-black">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2">
          ← Назад к блогам
        </Link>
        
        <article className="flex-1">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            {post.title}
          </h1>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>📅 {post.date}</span>
            <span>✍️ {post.author}</span>
          </div>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            💡 Статья из блога
          </p>
        </div>
      </main>
    </div>
  );
}