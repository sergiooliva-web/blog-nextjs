import type { ZodError } from "zod";

/**
 * Преобразует сложный объект ошибки Zod в плоский словарь, удобный для фронтенда.
 * Позволяет привязывать массивы ошибок к конкретным полям формы (например, для подсветки инпутов).
 * Если поле определить не удалось, ошибка записывается в ключ "root".
 *
 * @param error - Объект ошибки, возвращаемый методом Zod `.safeParse()`.
 * @returns Словарь вида `{ имя_поля: ["текст ошибки 1", "текст ошибки 2"] }`.
 */
export function formatZodError(error?: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  if (!error) return fieldErrors;

  error.issues.forEach((issue) => {
    const fieldName = issue.path[0]?.toString() || "root";

    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }

    fieldErrors[fieldName].push(issue.message);
  });

  return fieldErrors;
}
