/**
 * Escape a string for safe use inside a RegExp.
 * Prevents ReDoS (Regex Denial of Service) when user input is used in $regex queries.
 *
 * Example:
 *   escapeRegex("hello.world*") → "hello\\.world\\*"
 *   then: { $regex: escapeRegex(input), $options: "i" }
 */
function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a safe case-insensitive regex query object for MongoDB.
 * Returns null if input is empty/invalid.
 */
function safeRegex(str) {
  const escaped = escapeRegex(str?.trim());
  if (!escaped) return null;
  return { $regex: escaped, $options: "i" };
}

/**
 * Sanitize a numeric query param.
 * Returns the number, or undefined if not a valid finite number or empty string.
 */
function safeNumber(val) {
  if (val === "" || val === null || val === undefined) return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Clamp a pagination page number (min 1).
 */
function safePage(val, defaultVal = 1) {
  const n = parseInt(val, 10);
  return n > 0 ? n : defaultVal;
}

/**
 * Clamp a pagination limit (max 100, min 1).
 */
function safeLimit(val, defaultVal = 9) {
  const n = parseInt(val, 10);
  if (!n || n < 1) return defaultVal;
  return Math.min(n, 100);
}

module.exports = { escapeRegex, safeRegex, safeNumber, safePage, safeLimit };
