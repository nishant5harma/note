/**
 * Canonicalize and compute dedupe hash.
 * Uses phone | email | source | externalId (stable order).
 */
export declare function computeDedupeHash({ phone, email, source, externalId, }: {
    phone?: string | null;
    email?: string | null;
    source?: string | null;
    externalId?: string | null;
}): string;
/**
 * Try to acquire a Redis guard key using SETNX + PEXPIRE.
 * Returns true if acquired, false if already exists.
 *
 * Using SETNX + PEXPIRE avoids TypeScript overload issues with client.set(...)
 * and works reliably: setnx returns 1 when key created, 0 if key exists.
 */
export declare function tryAcquireRedisGuard(key: string, ttlMs?: number): Promise<boolean>;
/**
 * Release the guard (optional).
 */
export declare function releaseRedisGuard(key: string): Promise<void>;
//# sourceMappingURL=intake.util.d.ts.map