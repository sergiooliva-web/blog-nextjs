import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/**
 * Прокси-маршрут для отдачи медиафайлов.
 * Используется браузером напрямую (например, в теге <img src="...">).
 *
 * @returns Возвращает сырые байты файла с заголовком Content-Type (image/jpeg, image/png и т.д.).
 * Если файл не найден, возвращает HTTP 404.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;

  const safeFilename = path.basename(filename);

  const UPLOAD_DIR = path.join(process.cwd(), "uploads");
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  const ext = safeFilename.split(".").pop()?.toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === "png") contentType = "image/png";
  if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
  if (ext === "webp") contentType = "image/webp";
  if (ext === "gif") contentType = "image/gif";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
