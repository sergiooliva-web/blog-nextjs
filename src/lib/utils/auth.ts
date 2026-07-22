import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

/**
 * Достает JWT-токен из HttpOnly куки, расшифровывает его и возвращает ID пользователя.
 * Возвращает null, если пользователь не авторизован или токен протух.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

    return decoded.userId;
  } catch (error) {
    return null;
  }
}
