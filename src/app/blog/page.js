import Link from 'next/link';

export default async function BlogPage() {
  // Получаем ВСЕ посты из БД
  const posts = await getAllPostsFromDatabase();
  
  return (
    <div>
      <h1>Все посты блога</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            {/* Ссылка на динамическую страницу */}
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function getAllPostsFromDatabase() {
  // SELECT * FROM posts
  return [
    { id: 1, slug: 'hello-world', title: 'Hello World!' },
    { id: 2, slug: 'my-post', title: 'Мой пост' },
    { id: 3, slug: 'nextjs-tutorial', title: 'Урок по Next.js' },
  ];
}