"use server";

import { prisma } from "@/lib/db";
import { Post } from "@prisma/client";

export const postRepository = {
  async getAllPosts(): Promise<Post[] | null> {
    return await prisma.post.findMany({ orderBy: { date: "desc" } });
  },

  async getBySlug(slug: string): Promise<Post | null> {
    return await prisma.post.findUnique({ where: { slug } });
  },

  async addPost(postData: {
    slug: string;
    title: string;
    description?: string;
    content?: string;
    author?: string;
  }): Promise<Post | null> {
    return await prisma.post.create({
      data: {
        slug: postData.slug,
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
      },
    });
  },

  async deletePost(id: string | number): Promise<boolean | null> {
    await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });

    return true;
  },

  async updatePost(
    id: string | number,
    postData: {
      slug?: string;
      title?: string;
      description?: string;
      content?: string;
      author?: string;
    },
  ): Promise<Post | null> {
    return await prisma.post.update({
      where: {
        id: Number(id),
      },
      data: {
        slug: postData.slug,
        title: postData.title,
        description: postData.description,
        content: postData.content,
        author: postData.author,
      },
    });
  },
};
