export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/lib/services/auth_service";
import { handleResult } from "@/lib/utils/api_response";
import { success } from "@/lib/result";

/**
 * Аутентификация.
 * В случае успеха автоматически устанавливает защищенную HttpOnly Cookie `auth_token` в браузер.
 *
 * @param request - Ожидает JSON { email, password }.
 * @returns { success: true, data: { user: SafeUser } }.
 * При неверном email или пароле возвращает INVALID_CREDENTIALS.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await authService.login(body);

    if (result.isSuccess) {
      (await cookies()).set({
        name: "auth_token",
        value: result.data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return handleResult(success({ user: result.data.user }));
    }

    return handleResult(result);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST" } },
      { status: 400 },
    );
  }
}
