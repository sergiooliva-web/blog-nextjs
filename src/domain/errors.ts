export type AppError =
  | { code: "NOT_FOUND"; message: string }
  | { code: "DATABASE_FATAL_ERROR"; message: string };
