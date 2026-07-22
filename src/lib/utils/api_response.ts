import { NextResponse } from "next/server";
import type { AppResult } from "@/lib/result";
import type { AppError } from "@/lib/domain/errors";

/**
 * Универсальный транслятор: превращает AppResult в готовый HTTP-ответ Next.js.
 * @param result - Результат выполнения сервиса.
 * @param successStatus - HTTP-статус при успехе.
 */
export function handleResult<T>(
  result: AppResult<T, AppError>,
  successStatus: number = 200,
): NextResponse {
  if (result.isSuccess) {
    return NextResponse.json(
      result.data !== undefined
        ? { success: true, data: result.data }
        : { success: true },
      { status: successStatus },
    );
  }

  const err = result.error;

  switch (err.code) {
    case "VALIDATION_ERROR":
      return NextResponse.json(
        { error: { code: err.code, fields: err.fields } },
        { status: 400 },
      );

    case "NOT_FOUND":
      return NextResponse.json({ error: { code: err.code } }, { status: 404 });

    case "FORBIDDEN":
      return NextResponse.json({ error: { code: err.code } }, { status: 403 });

    case "DUPLICATE_ENTITY":
      return NextResponse.json(
        { error: { code: err.code, fields: err.fields } },
        { status: 409 },
      );

    case "TOO_MANY_REQUESTS":
      return NextResponse.json(
        { error: { code: err.code, retryAfter: err.retryAfter } },
        {
          status: 429,
          headers: { "Retry-After": `${err.retryAfter}` },
        },
      );

    case "RELATION_VIOLATION":
      return NextResponse.json({ error: { code: err.code } }, { status: 400 });

    case "DATABASE_FATAL_ERROR":
      console.error("[500 ERROR]:", err.details);
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR" } },
        { status: 500 },
      );

    case "FILE_UPLOAD_ERROR":
      console.error("[FILE_ERROR]:", err.details);
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR" } },
        { status: 500 },
      );

    case "INVALID_CREDENTIALS":
      return NextResponse.json({ error: { code: err.code } }, { status: 401 });

    default:
      const _: never = err;
      return NextResponse.json(
        { error: { code: "UNKNOWN_ERROR" } },
        { status: 500 },
      );
  }
}
