export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { postService } from "@/lib/services/post_service";
import { handleResult } from "@/lib/utils/api_response";
import { getCurrentUserId } from "@/lib/utils/auth";

/**
 * Удаляет публикацию по её ID.
 * Авторизация: ТРЕБУЕТСЯ. Удалить можно только СВОЙ пост.
 *
 * @param context - Извлекает ID поста из URL: /api/posts/[id]
 * @returns { success: true } или ошибку (FORBIDDEN / NOT_FOUND).
 */
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authorId = await getCurrentUserId();
  if (!authorId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const postId = Number(id);
  if (isNaN(postId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  const result = await postService.deletePost(postId, authorId);
  return handleResult(result);
}

/**
 * Частично обновляет публикацию по её ID.
 * Авторизация: ТРЕБУЕТСЯ. Обновить можно только СВОЙ пост.
 *
 * @param request - Ожидает JSON с любыми полями из { title, content, description, image }.
 * @returns { success: true, data: PostFullItemDTO } или ошибку (FORBIDDEN / NOT_FOUND).
 */
export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const authorId = await getCurrentUserId();
  if (!authorId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const postId = Number(id);
  if (isNaN(postId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR" } },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    const result = await postService.updatePost(postId, body, authorId);

    return handleResult(result);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }
}
