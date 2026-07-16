"use server";

import { prisma } from '@/lib/db';

// Получить все посты
export async function getAllPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { date: 'desc' }
    });
    return posts;
  } catch (error) {
    console.error('Ошибка получения постов из БД:', error);
    return [];
  }
}

// Получить пост по slug
export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug }
    });
    return post;
  } catch (error) {
    console.error(`Ошибка получения поста со slug ${slug}:`, error);
    return null;
  }
}

// Добавить новый пост
export async function addPost(postData: { slug: string; title: string; description?: string; content?: string; author?: string }) {
  try {
    const newPost = await prisma.post.create({
      data: {
        slug: postData.slug,
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author, 
      }
    });
    
    return newPost;
  } catch (error) {
    console.error('Ошибка сохранения поста в БД:', error);
    throw new Error('Не удалось сохранить пост');
  }
}

// Удалить пост
export async function deletePost(id: string | number) {
  try {
    await prisma.post.delete({
      where: { 
        id: Number(id) 
      }
    });
    return true;
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    return false;
  }
}

// Обновить существующий пост
export async function updatePost(
  id: string | number, 
  postData: { slug?: string; title?: string; description?: string; content?: string; author?: string }
) {
  try {
    const updatedPost = await prisma.post.update({
      where: { 
        id: Number(id) 
      },
      data: {
        slug: postData.slug,
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
      }
    });
    
    return updatedPost;
  } catch (error) {
    console.error(`Ошибка обновления поста с ID ${id}:`, error);
    throw new Error('Не удалось обновить пост');
  }
}