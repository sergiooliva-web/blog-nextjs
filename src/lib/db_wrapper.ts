import { Prisma } from "@prisma/client";
import { AppResult, success, failure } from "@/lib/result";
import type { AppError } from "@/domain/errors";

export function withDatabaseErrors<T, Args extends any[]>(
  func: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<AppResult<T, AppError>> {
  return async (...args: Args) => {
    try {
      const result = await func(...args);
      return success(result);
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        //TODO: Добавить ошибки призмы https://www.prisma.io/docs/orm/reference/error-reference
      }

      console.error(`[DB_FATAL_ERROR]:`, e);
      return failure({
        code: "DATABASE_FATAL_ERROR",
        message: e instanceof Error ? e.message : "Неизвестная ошибка БД",
      });
    }
  };
}
