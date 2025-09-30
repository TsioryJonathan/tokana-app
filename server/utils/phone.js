export function normalizeMgPhone(input) {
  if (!input) return null;
  let s = String(input).trim();
  // remove spaces, dashes, dots, parentheses
  s = s.replace(/[\s.\-()]/g, "");
  // Convert 261XXXXXXXXX to +261XXXXXXXXX
  if (/^261\d{9}$/.test(s)) {
    return `+${s}`;
  }
  // If already +261XXXXXXXXX, keep
  if (/^\+261\d{9}$/.test(s)) {
    return s;
  }
  // Local formats 0XXXXXXXXX for MG mobile 3x or landline 20
  const m = s.match(/^0(3\d|20)(\d{7})$/);
  if (m) {
    return `+261${m[1]}${m[2]}`; // drop leading 0
  }
  // If nothing matches, return original trimmed (will fail validation later)
  return s;
}

export function isValidMgPhone(input) {
  if (!input) return false;
  const s = normalizeMgPhone(input);
  return /^\+261(3\d|20)\d{7}$/.test(s);
}
