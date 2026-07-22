export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { postService } from "@/lib/services/post_service";
import { handleResult } from "@/lib/utils/api_response";
import { getCurrentUserId } from "@/lib/utils/auth";

/**
 * Получает список всех публикаций.
 * Авторизация: НЕ ТРЕБУЕТСЯ.
 *
 * @returns { success: true, data: PostListItemDTO[] }
 */
export async function GET() {
  const result = await postService.getAllPosts();
  return handleResult(result);
}

/**
 * Создает новую публикацию.
 * Авторизация: ТРЕБУЕТСЯ (HttpOnly Cookie 'auth_token').
 *
 * @param request - Ожидает JSON { title, content?, description?, image? }.
 * @returns { success: true, data: PostFullItemDTO } или объект ошибки (VALIDATION_ERROR / UNAUTHORIZED).
 */
export async function POST(request: Request) {
  const authorId = await getCurrentUserId();
  if (!authorId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED" } },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const result = await postService.createPost(body, authorId);

    return handleResult(result, 201);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }
}
