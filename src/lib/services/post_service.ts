import { postsRepository } from "@/lib/repositories/posts_repository";
import { AppResult, success, failure } from "@/lib/result";
import { isAppError, type AppError } from "@/lib/domain/errors";
import { CreatePostSchema, UpdatePostSchema } from "@/lib/domain/schemas";
import type { Post } from "@prisma/client";
import { formatZodError } from "../utils/zod_error_parser";

export const postService = {
  async getAllPosts(): Promise<AppResult<Post[], AppError>> {
    const getPostsResponse = await postsRepository.getAllPosts();

    if (isAppError(getPostsResponse)) {
      return failure(getPostsResponse);
    }

    return success(getPostsResponse);
  },

  async getBySlug(postSlug: string): Promise<AppResult<Post | null, AppError>> {
    const getPostBySlugResponse = await postsRepository.getBySlug(postSlug);

    if (isAppError(getPostBySlugResponse)) {
      return failure(getPostBySlugResponse);
    }

    return success(getPostBySlugResponse);
  },

  async createPost(rawData: unknown): Promise<AppResult<Post, AppError>> {
    const parsed = CreatePostSchema.safeParse(rawData);
    if (!parsed.success) {
      return failure({
        code: "VALIDATION_ERROR",
        fields: formatZodError(parsed.error),
      });
    }

    const createNewPostResponse = await postsRepository.addPost(parsed.data);

    if (isAppError(createNewPostResponse)) {
      return failure(createNewPostResponse);
    }

    return success(createNewPostResponse);
  },

  async deletePost(postId: number): Promise<AppResult<void, AppError>> {
    const deletePostResponse = await postsRepository.deletePost(postId);

    if (isAppError(deletePostResponse)) {
      return failure(deletePostResponse);
    }

    return success(undefined);
  },

  async updatePost(
    postId: number,
    rawData: unknown,
  ): Promise<AppResult<Post, AppError>> {
    const parsed = UpdatePostSchema.safeParse(rawData);
    if (!parsed.success) {
      return failure({
        code: "VALIDATION_ERROR",
        fields: formatZodError(parsed.error),
      });
    }

    const updatePostResponse = await postsRepository.updatePost(
      postId,
      parsed.data,
    );

    if (isAppError(updatePostResponse)) {
      return failure(updatePostResponse);
    }

    return success(updatePostResponse);
  },
};
