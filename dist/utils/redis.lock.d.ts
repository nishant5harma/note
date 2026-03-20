/**
 * Try to acquire a distributed lock safely.
 * Returns { acquired: boolean, token: string | null }
 *
 * We store a random token in the lock so that only
 * the owner who set it can release it.
 */
export declare function tryAcquireLock(key: string, ttlMs?: number): Promise<{
    acquiredLock: boolean;
    token: string | null;
}>;
/**
 * Release the lock *only if* the token matches.
 * Prevents accidental unlock of someone else's lock.
 */
export declare function releaseLock(key: string, token: string): Promise<boolean>;
export declare function leadStatusLockKey(leadId: string | number): string;
/**
 * Capacity claim helpers
 * - We use a redis counter to mark temporary claims to avoid race
 */
export declare function claimCapacityForUser(userId: string, ttlMs?: number): Promise<boolean>;
export declare function releaseCapacityClaim(userId: string): Promise<void>;
//# sourceMappingURL=redis.lock.d.ts.map