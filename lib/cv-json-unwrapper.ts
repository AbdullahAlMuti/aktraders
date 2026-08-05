/**
 * Recursively unwraps single-stringified, double-stringified, or object JSON payloads.
 * Prevents "Not Provided in CV" fallbacks on Employee Profile tabs when Supabase
 * stores structured_data as text or a stringified JSON string.
 */
export function safeParseStructuredJSON(input: any): any {
  if (!input) return null;
  if (typeof input === "object") return input;
  if (typeof input === "string") {
    try {
      let parsed = JSON.parse(input);
      // Recursively unwrap stringified JSON strings (handles double or triple encoding)
      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}
