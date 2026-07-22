import slugify from "slugify";
import { postsRepository } from "@/lib/repositories/posts_repository";
import { isAppError } from "@/lib/domain/errors";

/**
 * Генерирует уникальный URL-безопасный slug из заголовка.
 * Автоматически добавляет числовой суффикс, если такой slug уже занят.
 */
export async function generateUniqueSlug(
  title: string,
  customSlug?: string,
): Promise<string> {
  const baseSlug = customSlug
    ? slugify(customSlug, { lower: true, strict: true })
    : slugify(title, { lower: true, strict: true, locale: "ru" });

  let currentSlug = baseSlug || "post";
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const existingPost = await postsRepository.getBySlug(currentSlug);

    if (isAppError(existingPost)) {
      break;
    }

    if (existingPost === null) {
      isUnique = true;
    } else {
      currentSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return currentSlug;
}
