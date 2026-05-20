export * from './schemas';

/**
 * Parse a Zod schema and return field-level errors as a flat record.
 * Returns null if valid.
 */
import type { ZodSchema, ZodError } from 'zod';

export function parseForm<T>(
  schema: ZodSchema<T>,
  data: unknown,
): { data: T; errors: null } | { data: null; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, errors: null };
  const errors: Record<string, string> = {};
  (result.error as ZodError).errors.forEach((e) => {
    const key = e.path.join('.');
    if (!errors[key]) errors[key] = e.message;
  });
  return { data: null, errors };
}
