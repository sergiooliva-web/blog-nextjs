import fs from 'fs';
import path from 'path';

// Путь к файлу с постами
const postsFilePath = path.join(process.cwd(), 'src/data/posts.json');

// Получить все посты
export function getAllPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения файла постов:', error);
    return [];
  }
}

// Получить пост по slug
export function getPostBySlug(slug) {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
}

// Добавить новый пост
export function addPost(postData) {
  const posts = getAllPosts();
  
  // Генерируем ID
  const newId = String(posts.length > 0 ? Math.max(...posts.map(p => parseInt(p.id))) + 1 : 1);
  
  const newPost = {
    id: newId,
    ...postData,
    date: new Date().toISOString().split('T')[0], // Текущая дата
    author: 'Аноним' // Можно заменить на имя пользователя
  };
  
  posts.push(newPost);
  
  // Сохраняем в файл
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
    return newPost;
  } catch (error) {
    console.error('Ошибка сохранения поста:', error);
    throw new Error('Не удалось сохранить пост');
  }
}

// Удалить пост (опционально)
export function deletePost(id) {
  const posts = getAllPosts();
  const filtered = posts.filter(post => post.id !== id);
  
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    return false;
  }
}