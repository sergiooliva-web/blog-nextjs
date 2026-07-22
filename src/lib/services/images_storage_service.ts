import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { AppResult, success, failure } from "@/lib/result";
import type { AppError } from "@/lib/domain/errors";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const imagesStorageService = {
  /**
   * Принимает изображение, валидирует его тип, генерирует UUID и сохраняет на диск.
   * @returns Имя сохраненного файла
   */
  async saveImage(file: File): Promise<AppResult<string, AppError>> {
    try {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        return failure({
          code: "VALIDATION_ERROR",
          fields: { image: ["err_file_must_be_image_jpg_png_webp_gif"] },
        });
      }

      const extension = file.name.split(".").pop() || "bin";
      const uniqueFilename = `${crypto.randomUUID()}.${extension}`;

      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filePath = path.join(UPLOAD_DIR, uniqueFilename);
      await fs.writeFile(filePath, buffer);

      return success(uniqueFilename);
    } catch (error) {
      return failure({
        code: "FILE_UPLOAD_ERROR",
      });
    }
  },

  /**
   * Возвращает готовую ссылку на изображение.
   */
  getFileUrl(filename: string): string {
    return `/api/media/${filename}`;
  },
};
