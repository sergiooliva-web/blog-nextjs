export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { imagesStorageService } from "@/lib/services/images_storage_service";
import { handleResult } from "@/lib/utils/api_response";
import { getCurrentUserId } from "@/lib/utils/auth";
import { success } from "@/lib/result";

/**
 * Загрузка изображения на сервер.
 * Авторизация: ТРЕБУЕТСЯ.
 *
 * @param request - Ожидает multipart/form-data с полем "image".
 * @returns { success: true, data: { url: "/api/media/имя_файла.тип" } }.
 * Этот URL нужно использовать при создании поста.
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
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            fields: { image: ["err_file_required"] },
          },
        },
        { status: 400 },
      );
    }

    const result = await imagesStorageService.saveImage(file);

    if (result.isSuccess) {
      const url = imagesStorageService.getFileUrl(result.data);
      return handleResult(success({ url }), 201);
    }

    return handleResult(result);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }
}
