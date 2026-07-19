export type AppError =
  | { code: "VALIDATION_ERROR"; fields: Record<string, string[]> }
  | { code: "DUPLICATE_ENTITY"; fields: string[] }
  | { code: "RELATION_VIOLATION"; field?: string; details?: string }
  | { code: "NOT_FOUND" }
  | { code: "DATABASE_FATAL_ERROR"; details: string };

export function isAppError(obj: any): obj is AppError {
  return obj !== null && typeof obj === "object" && "code" in obj;
}
