import { prisma } from "@/lib/db/db";
import { repositoryWithDatabaseErrors } from "./repositories_wrapper";

export const postsRepository = {
  getAllPosts: repositoryWithDatabaseErrors(async () => {
    return await prisma.post.findMany({ orderBy: { date: "desc" } });
  }),

  getBySlug: repositoryWithDatabaseErrors(async (slug: string) => {
    return await prisma.post.findUnique({ where: { slug } });
  }),

  addPost: repositoryWithDatabaseErrors(
    async (postData: {
      slug: string;
      title: string;
      description?: string;
      content?: string;
      author?: string;
    }) => {
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
  ),

  deletePost: repositoryWithDatabaseErrors(async (id: string | number) => {
    await prisma.post.delete({
      where: {
        id: Number(id),
      },
    });
  }),

  updatePost: repositoryWithDatabaseErrors(
    async (
      id: string | number,
      postData: {
        slug?: string;
        title?: string;
        description?: string;
        content?: string;
        author?: string;
      },
    ) => {
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
  ),
};
