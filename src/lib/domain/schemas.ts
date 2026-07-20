import { z } from "zod";

export const CreatePostSchema = z.object({
  slug: z
    .string()
    .min(4, "err_slug_too_short")
    .regex(/^[a-z0-9-]+$/, "err_slug_invalid_format"),

  title: z.string().min(6, "err_title_too_short"),

  description: z.string().optional(),
  content: z.string().optional(),

  author: z.string().default("Anonymous"),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export type CreatePostDTO = z.infer<typeof CreatePostSchema>;
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema>;
