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
  // Local formats 0XXXXXXXXX for MG mobile 3x (including 30) or landline 20
  const m = s.match(/^0(30|3\d|20)(\d{7})$/);
  if (m) {
    return `+261${m[1]}${m[2]}`; // drop leading 0
  }
  // Format without leading 0: 30XXXXXXX, 3XXXXXXXX, 20XXXXXXX
  const m2 = s.match(/^(30|3\d|20)(\d{7})$/);
  if (m2) {
    return `+261${m2[1]}${m2[2]}`; // add +261 prefix
  }
  // If nothing matches, return original trimmed (will fail validation later)
  return s;
}

export function isValidMgPhone(input) {
  if (!input) return false;
  const s = normalizeMgPhone(input);
  // Accept 030, 032, 033, 034, 038, 020
  return /^\+261(30|3\d|20)\d{7}$/.test(s);
}
