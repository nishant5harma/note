// src/utils/redis.lock.ts
import { getRedisClient } from "@/db/redis.js";
import crypto from "crypto";

const client = getRedisClient();

/**
 * Try to acquire a distributed lock safely.
 * Returns { acquired: boolean, token: string | null }
 *
 * We store a random token in the lock so that only
 * the owner who set it can release it.
 */
export async function tryAcquireLock(
  key: string,
  ttlMs = 20000
): Promise<{ acquiredLock: boolean; token: string | null }> {
  const token = crypto.randomUUID(); // cryptographically strong

  const ok = await client.set(key, token, "PX", ttlMs, "NX");
  if (ok === "OK") {
    return { acquiredLock: true, token };
  }
  return { acquiredLock: false, token: null };
}

/**
 * Release the lock *only if* the token matches.
 * Prevents accidental unlock of someone else's lock.
 */
export async function releaseLock(key: string, token: string) {
  const releaseScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1]
    then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;
  let res;
  try {
    res = await client.eval(releaseScript, 1, key, token);
  } catch (e) {
    // ignore errors
  } finally {
    return res === 1;
  }
}

export function leadStatusLockKey(leadId: string | number) {
  return `lock:lead-status:${leadId}`;
}

// ----------- deprecated capacity claim helpers -----------------
// -- we now use DB transactions for accurate capacity tracking --

/**
 * Capacity claim helpers
 * - We use a redis counter to mark temporary claims to avoid race
 */
export async function claimCapacityForUser(userId: string, ttlMs = 60_000) {
  const key = `lead:capacity:claims:${userId}`;
  // increment provisional claims
  const claimed = await client.incr(key);
  if (claimed === 1) {
    // first claim -> set TTL
    await client.pexpire(key, ttlMs);
  }
  // Let caller verify DB count + claimed vs max separately, but for simplicity we return true here.
  // Note: In handler we also double-check DB counts before performing final assignment.
  return true;
}

export async function releaseCapacityClaim(userId: string) {
  const key = `lead:capacity:claims:${userId}`;
  try {
    const v = await client.decr(key);
    if (v <= 0) await client.del(key);
  } catch (e) {
    // ignore
  }
}
