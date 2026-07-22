import { prisma } from "@/lib/db/db";
import { repositoryWithDatabaseErrors } from "./repositories_wrapper";
import { Prisma } from "@prisma/client";

const postListItemSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true },
  },
} satisfies Prisma.PostSelect;

const postFullItemSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  content: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.PostSelect;

export type PostListItemDTO = Prisma.PostGetPayload<{
  select: typeof postListItemSelect;
}>;
export type PostFullItemDTO = Prisma.PostGetPayload<{
  select: typeof postFullItemSelect;
}>;

export const postsRepository = {
  getAllPosts: repositoryWithDatabaseErrors(async () => {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      select: postListItemSelect,
    });
  }),

  getBySlug: repositoryWithDatabaseErrors(async (slug: string) => {
    return await prisma.post.findUnique({
      where: { slug },
      select: postFullItemSelect,
    });
  }),

  addPost: repositoryWithDatabaseErrors(
    async (postData: {
      slug: string;
      title: string;
      description?: string;
      content?: string;
      authorId: number;
    }) => {
      return await prisma.post.create({
        data: postData,
        select: postFullItemSelect,
      });
    },
  ),

  updatePost: repositoryWithDatabaseErrors(
    async (id: number, postData: any) => {
      return await prisma.post.update({
        where: { id },
        data: postData,
        select: postFullItemSelect,
      });
    },
  ),

  getLastPostByAuthorId: repositoryWithDatabaseErrors(
    async (authorId: number) => {
      return await prisma.post.findFirst({
        where: { authorId },
        orderBy: { createdAt: "desc" },
      });
    },
  ),

  getById: repositoryWithDatabaseErrors(async (id: number) => {
    return await prisma.post.findUnique({ where: { id } });
  }),

  deletePost: repositoryWithDatabaseErrors(async (id: number) => {
    await prisma.post.delete({ where: { id } });
  }),
};
