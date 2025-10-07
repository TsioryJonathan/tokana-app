export function normalizeLocalPhone(input: string): string {
  if (!input) return "";
  return String(input).trim().replace(/[\s.\-()]/g, "");
}

export function isLikelyMgPhone(input: string): boolean {
  const s = normalizeLocalPhone(input);
  if (/^\+?261\d{9}$/.test(s)) return true; // E.164 or missing plus
  if (/^0(3\d|20)\d{7}$/.test(s)) return true; // local 0-format
  return false;
}

/**
 * Convert cleaned Madagascar numbers to a canonical representation when possible.
 * - If starts with "+261" keep as is
 * - If starts with "261" add leading +
 * - If local 0(3x|20)XXXXXXX, keep local form (server will normalize)
 */
export function toE164If261(input: string): string {
  const s = normalizeLocalPhone(input);
  if (/^\+261\d{9}$/.test(s)) return s;
  if (/^261\d{9}$/.test(s)) return `+${s}`;
  if (/^0(3\d|20)\d{7}$/.test(s)) return s; // let server normalize
  return s;
}
