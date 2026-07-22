export type AppError =
  | { code: "VALIDATION_ERROR"; fields: Record<string, string[]> }
  | { code: "DUPLICATE_ENTITY"; fields: string[] }
  | { code: "RELATION_VIOLATION"; field?: string; details?: string }
  | { code: "NOT_FOUND" }
  | { code: "FORBIDDEN" }
  | { code: "TOO_MANY_REQUESTS"; retryAfter: number }
  | { code: "DATABASE_FATAL_ERROR"; details: string }
  | { code: "INVALID_CREDENTIALS" }
  | { code: "FILE_UPLOAD_ERROR" };

export function isAppError(obj: any): obj is AppError {
  return obj !== null && typeof obj === "object" && "code" in obj;
}
