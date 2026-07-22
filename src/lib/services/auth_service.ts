import {
  SafeUserDTO,
  usersRepository,
} from "@/lib/repositories/users_repository";
import { AppResult, success, failure } from "@/lib/result";
import { AppError, isAppError } from "@/lib/domain/errors";
import { LoginUserSchema, RegisterUserSchema } from "@/lib/domain/schemas";
import { formatZodError } from "@/lib/utils/zod_error_parser";
import bcrypt from "bcrypt";
import { env } from "@/lib/env";
import jwt from "jsonwebtoken";

export const authService = {
  /**
   * Валидирует данные, хэширует пароль и регистрирует нового пользователя.
   * Делегирует проверку уникальности email на уровень БД.
   *
   * @param rawData - Данные из HTTP-запроса
   * @returns Безопасный объект пользователя (без хэша пароля).
   */
  async register(rawData: unknown): Promise<AppResult<SafeUserDTO, AppError>> {
    const parsed = RegisterUserSchema.safeParse(rawData);
    if (!parsed.success) {
      return failure({
        code: "VALIDATION_ERROR",
        fields: formatZodError(parsed.error),
      });
    }

    const { email, name, password } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUserResponse = await usersRepository.createUser(
      email,
      name,
      passwordHash,
    );

    if (isAppError(newUserResponse)) {
      return failure(newUserResponse);
    }

    return success(newUserResponse);
  },

  /**
   * Проверяет учетные данные пользователя и генерирует JWT-токен.
   * @param rawData - Данные из HTTP-запроса
   * @returns Токен и безопасный объект пользователя (без хэша пароля).
   */
  async login(
    rawData: unknown,
  ): Promise<AppResult<{ token: string; user: SafeUserDTO }, AppError>> {
    const parsed = LoginUserSchema.safeParse(rawData);
    if (!parsed.success) {
      return failure({
        code: "VALIDATION_ERROR",
        fields: formatZodError(parsed.error),
      });
    }
    const { email, password } = parsed.data;

    const userResult = await usersRepository.getByEmail(email);

    if (isAppError(userResult)) return failure(userResult);

    if (!userResult) {
      return failure({ code: "INVALID_CREDENTIALS" });
    }

    const isMatch = await bcrypt.compare(password, userResult.passwordHash);
    if (!isMatch) {
      return failure({ code: "INVALID_CREDENTIALS" });
    }

    const jwtPayload = { userId: userResult.id };

    const jwtSecret = env.JWT_SECRET;

    const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "7d" });

    const { passwordHash: _, ...safeUser } = userResult;

    return success({
      token,
      user: safeUser,
    });
  },
};
