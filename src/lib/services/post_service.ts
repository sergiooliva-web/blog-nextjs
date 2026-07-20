import { postsRepository } from "@/lib/repositories/posts_repository";
import { AppResult, success, failure } from "@/lib/result";
import { isAppError, type AppError } from "@/lib/domain/errors";
import { CreatePostSchema, UpdatePostSchema } from "@/lib/domain/schemas";
import type { Post } from "@prisma/client";
import { formatZodError } from "../utils/zod_error_parser";

export const postService = {
  /**
   * Получает список всех публикаций блога.
   *
   * @returns Массив постов. При системном сбое БД возвращает DATABASE_FATAL_ERROR.
   */
  async getAllPosts(): Promise<AppResult<Post[], AppError>> {
    const getPostsResponse = await postsRepository.getAllPosts();

    if (isAppError(getPostsResponse)) {
      return failure(getPostsResponse);
    }

    return success(getPostsResponse);
  },

  /**
   * Ищет публикацию по уникальному URL (slug).
   * Внимание: отсутствие поста в базе - это валидный результат (data будет null), а не ошибка бизнес-логики.
   *
   * @param postSlug - Строковый URL-идентификатор поста.
   * @returns Объект поста или `null`. При системном сбое БД возвращает DATABASE_FATAL_ERROR.
   */
  async getBySlug(postSlug: string): Promise<AppResult<Post | null, AppError>> {
    const getPostBySlugResponse = await postsRepository.getBySlug(postSlug);

    if (isAppError(getPostBySlugResponse)) {
      return failure(getPostBySlugResponse);
    }

    return success(getPostBySlugResponse);
  },

  /**
   * Проводит строгую валидацию входящих данных и создает новую публикацию.
   * Делегирует проверку уникальности `slug` на уровень базы данных.
   *
   * @param rawData - Нетипизированный объект данных (JSON из тела запроса).
   * @returns Созданный объект поста.
   *
   * Возможные ошибки:
   * - `VALIDATION_ERROR` - неверный формат входящих данных.
   * - `DUPLICATE_ENTITY` - публикация с таким slug уже существует.
   * - `DATABASE_FATAL_ERROR` - системный сбой.
   */
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

  /**
   * Удаляет публикацию по её внутреннему ID.
   *
   * @param postId - Числовой идентификатор поста.
   * @returns Подтверждение успешного удаления (void).
   *
   * Возможные ошибки:
   * - `NOT_FOUND` - пост с таким ID не существует.
   * - `DATABASE_FATAL_ERROR` - системный сбой или нарушение связей.
   */
  async deletePost(postId: number): Promise<AppResult<void, AppError>> {
    const deletePostResponse = await postsRepository.deletePost(postId);

    if (isAppError(deletePostResponse)) {
      return failure(deletePostResponse);
    }

    return success(undefined);
  },

  /**
   * Частично обновляет данные существующей публикации.
   * Валидирует только те поля, которые были переданы (остальные игнорируются).
   *
   * @param postId - Числовой идентификатор обновляемого поста.
   * @param rawData - Объект с новыми значениями полей.
   * @returns Обновленный объект поста.
   *
   * Возможные ошибки:
   * - `VALIDATION_ERROR` - переданные поля не прошли проверку.
   * - `NOT_FOUND` - пост для обновления не найден.
   * - `DUPLICATE_ENTITY` - новый slug уже занят другим постом.
   * - `DATABASE_FATAL_ERROR` - системный сбой.
   */
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
