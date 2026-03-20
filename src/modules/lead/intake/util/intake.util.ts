// src/modules/lead/util/intake.util.ts
import crypto from "crypto";
import { getRedisClient } from "@/db/redis.js";

/**
 * Canonicalize and compute dedupe hash.
 * Uses phone | email | source | externalId (stable order).
 */
export function computeDedupeHash({
  phone,
  email,
  source,
  externalId,
}: {
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  externalId?: string | null;
}) {
  const normalizePhone = (p?: string | null) =>
    p ? p.replace(/[^\d+]/g, "") : "";
  const normalizeEmail = (e?: string | null) =>
    e ? e.trim().toLowerCase() : "";
  const parts = [
    normalizePhone(phone),
    normalizeEmail(email),
    (source ?? "").trim().toLowerCase(),
    (externalId ?? "").trim(),
  ].filter(Boolean);
  const input = parts.join("|");
  const h = crypto.createHash("sha256").update(input).digest("hex");
  return h.slice(0, 64);
}

/**
 * Try to acquire a Redis guard key using SETNX + PEXPIRE.
 * Returns true if acquired, false if already exists.
 *
 * Using SETNX + PEXPIRE avoids TypeScript overload issues with client.set(...)
 * and works reliably: setnx returns 1 when key created, 0 if key exists.
 */
export async function tryAcquireRedisGuard(key: string, ttlMs = 30_000) {
  const client = getRedisClient();
  // setnx returns 1 if key set, 0 otherwise
  const ok = await client.setnx(key, "1");
  if (ok === 1) {
    // set expiry (PX)
    try {
      // pexpire returns 1 if timeout set, 0 if key doesn't exist
      await client.pexpire(key, ttlMs);
    } catch {
      // ignore; key is set but expire may have failed - acceptable fallback
    }
    return true;
  }
  return false;
}

/**
 * Release the guard (optional).
 */
export async function releaseRedisGuard(key: string) {
  const client = getRedisClient();
  await client.del(key);
}
