/**
 * Returns the correct column name based on locale.
 * If locale is 'id', appends '_id' suffix; otherwise returns the base name.
 * Example: field(locale, 'title') → 'title' | 'title_id'
 */
export function f(locale: string, base: string): string {
  return locale === "id" ? `${base}_id` : base;
}

export type Locale = "en" | "id";
