export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Выход из системы.
 * Принудительно удаляет сессионную Cookie `auth_token` из браузера.
 */
export async function POST() {
  (await cookies()).delete("auth_token");

  return NextResponse.json({ success: true });
}
