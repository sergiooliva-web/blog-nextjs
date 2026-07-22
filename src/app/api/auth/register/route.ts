export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth_service";
import { handleResult } from "@/lib/utils/api_response";

/**
 * Регистрация нового пользователя.
 *
 * @param request - Ожидает JSON { email, name, password }.
 * @returns { success: true, data: SafeUser } (без пароля).
 * При совпадении email возвращает DUPLICATE_ENTITY.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await authService.register(body);

    return handleResult(result, 201);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }
}
