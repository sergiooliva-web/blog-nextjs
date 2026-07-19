import { Prisma } from "@prisma/client";
import type { AppError } from "@/lib/domain/errors";

export function repositoryWithDatabaseErrors<T, Args extends any[]>(
  func: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<T | AppError> {
  return async (...args: Args) => {
    try {
      const result = await func(...args);
      return result;
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        //TODO: Добавить ошибки призмы https://www.prisma.io/docs/orm/reference/error-reference, которые являются нарушением логики.

        // P2000: Значение слишком длинное (The provided value for the column is too long)
        if (e.code === "P2000") {
          const column = (e.meta?.column_name as string) || "unknown";
          return {
            code: "VALIDATION_ERROR",
            fields: { [column]: ["err_value_too_long"] },
          };
        }

        // P2002: Нарушение уникальности (UNIQUE constraint failed)
        if (e.code === "P2002") {
          const target = e.meta?.target;
          const fields = Array.isArray(target)
            ? target
            : typeof target === "string"
              ? [target]
              : ["unknown"];

          return {
            code: "DUPLICATE_ENTITY",
            fields,
          };
        }

        // P2003: Нарушение внешнего ключа (Foreign key constraint failed)
        if (e.code === "P2003") {
          const field = e.meta?.field_name as string | undefined;
          return {
            code: "RELATION_VIOLATION",
            field: field || "unknown",
          };
        }

        // P2011 / P2012: Нарушение NOT NULL (Null constraint violation / Missing a required value)
        if (e.code === "P2011" || e.code === "P2012") {
          const constraint =
            (e.meta?.constraint as string[] | string) || "unknown";
          return {
            code: "VALIDATION_ERROR",
            fields: { [constraint.toString()]: ["err_required_field"] },
          };
        }

        // P2014: Ошибка связи (The change you are trying to make would violate the required relation)
        if (e.code === "P2014") {
          return { code: "RELATION_VIOLATION", details: "" };
        }

        // P2025: Запись не найдена (Record to update/delete not found)
        if (e.code === "P2025") {
          return {
            code: "NOT_FOUND",
          };
        }
      }

      return {
        code: "DATABASE_FATAL_ERROR",
        details: e instanceof Error ? e.message : "Неизвестная ошибка БД",
      };
    }
  };
}
