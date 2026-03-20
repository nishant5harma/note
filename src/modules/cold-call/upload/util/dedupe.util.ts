// /src/modules/cold-call/upload/util/dedupe.util.ts
import crypto from "crypto";

/**
 * computeColdCallDedupeHash
 * - Normalizes phone & email and computes a sha256 hex -> truncated if needed
 * - returns null when neither phone nor email present (important)
 */
export function computeColdCallDedupeHash(input: {
  phone?: string | null;
  email?: string | null;
}) {
  const normalizePhone = (p?: string | null) =>
    p ? String(p).replace(/[^\d+]/g, "") : "";
  const normalizeEmail = (e?: string | null) =>
    e ? String(e).trim().toLowerCase() : "";
  const parts = [
    normalizePhone(input.phone),
    normalizeEmail(input.email),
  ].filter(Boolean);

  // IMPORTANT: when neither phone nor email exist, return null to avoid treating blank rows as duplicates
  if (parts.length === 0) return null;

  const inputStr = parts.join("|");
  const h = crypto.createHash("sha256").update(inputStr).digest("hex");
  return h.slice(0, 64);
}
