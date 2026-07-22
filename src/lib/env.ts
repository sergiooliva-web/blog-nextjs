import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().pipe(z.url()),
  JWT_SECRET: z.string().min(32, "err_jwt_secret_too_short"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("err_environment_variables_is_not_exist");
  process.exit(1);
}

export const env = parsedEnv.data;
