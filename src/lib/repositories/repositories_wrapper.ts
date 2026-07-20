import { Prisma } from "@prisma/client";
import type { AppError } from "@/lib/domain/errors";

/**
 * Функция-обертка для безопасного выполнения запросов к базе данных.
 * Перехватывает системные исключения Prisma ORM и конвертирует их в строгие доменные ошибки `AppError`.
 *
 * Обязательна к применению для всех методов репозитория. Гарантирует, что слой
 * бизнес-логики никогда не столкнется с необработанными падениями (Unhandled Exceptions) от БД.
 *
 * Автоматически мапит следующие коды Prisma:
 * - P2000, P2011, P2012 -> `VALIDATION_ERROR`;
 * - P2002 -> `DUPLICATE_ENTITY`;
 * - P2003, P2014 -> `RELATION_VIOLATION`;
 * - P2025 -> `NOT_FOUND`;
 *
 * В случае возникновения неизвестной ошибки или ошибки не связанной с бизнес-логикой возвращает `DATABASE_FATAL_ERROR`.
 *
 * @param func - Исходная асинхронная функция, выполняющая запрос к БД.
 * @returns Новая функция с той же сигнатурой аргументов, возвращающая либо чистые данные `T`, либо объект `AppError`.
 *
 * @example
 * export const userRepository = {
 * // Оборачиваем запрос, чтобы безопасно перехватить возможное нарушение UNIQUE slug
 * addPost: repositoryWithDatabaseErrors(
 *   async (postData: {
 *     slug: string;
 *     title: string;
 *     description?: string;
 *     content?: string;
 *     author?: string;
 *   }) => {
 *     return await prisma.post.create({
 *       data: {
 *         slug: postData.slug,
 *         title: postData.title,
 *         description: postData.description,
 *         content: postData.content,
 *         author: postData.author,
 *       },
 *     });
 *   },
 * )
 */
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
