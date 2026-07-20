// src/app/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.data || []);
        } else {
          console.error('Ошибка API:', data.error);
          setPosts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки постов:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Загрузка...</div>
      </>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 bg-white dark:bg-black">
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
                  <span>{post.date}</span>
                  <span>{post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Делитесь своими мыслями
        </div>
      </footer>
    </div>
  );
}