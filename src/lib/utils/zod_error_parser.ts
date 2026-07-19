import type { ZodError } from "zod";

export function formatZodError(error?: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  if (!error) return fieldErrors;

  error.issues.forEach((issue) => {
    const fieldName = issue.path[0]?.toString() || "root";

    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }

    fieldErrors[fieldName].push(issue.message);
  });

  return fieldErrors;
}
