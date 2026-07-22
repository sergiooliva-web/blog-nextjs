import { z } from "zod";
const FORBIDDEN_WORDS = ["nottest", "nottest1"];

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(6, "err_title_too_short")
    .refine(
      (title) => {
        const lowerTitle = title.toLowerCase();
        return !FORBIDDEN_WORDS.some((badWord) => lowerTitle.includes(badWord));
      },
      {
        message: "err_title_forbidden_words",
      },
    ),

  description: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostDTO = z.infer<typeof CreatePostSchema>;
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema>;

const EASY_PASSWORDS = ["NotTest"];

export const RegisterUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(100, "err_email_too_long")
    .pipe(z.email("err_invalid_email")),

  name: z
    .string()
    .trim()
    .min(2, "err_name_too_short")
    .max(30, "err_name_too_long")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s_-]+$/, "err_name_invalid_chars")
    .refine(
      (name) => {
        const lowerName = name.toLowerCase();
        return !FORBIDDEN_WORDS.some((badWord) => lowerName.includes(badWord));
      },
      {
        message: "err_name_forbidden_words",
      },
    ),

  password: z
    .string()
    .min(8, "err_password_too_short")
    .max(72, "err_password_too_long")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)\S+$/, "err_password_too_weak")
    .refine(
      (password) => {
        return !EASY_PASSWORDS.some((easyPassword) =>
          password.includes(easyPassword),
        );
      },
      {
        message: "err_password_too_weak",
      },
    ),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().pipe(z.email("err_invalid_email")),
  password: z.string().min(1, "err_password_required"),
});
