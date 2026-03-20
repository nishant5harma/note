/**
 * Cold Call Auto-Unlock — Logic Only
 * ----------------------------------
 *
 * This file contains the PURE BUSINESS LOGIC used by the worker.
 * It does NOT schedule jobs and does NOT start workers.
 *
 * The worker will call this function whenever the scheduled job runs.
 *
 * Purpose:
 *   - Scan ColdCallEntry table
 *   - Find entries with:
 *         status = "in_progress"
 *         AND lockExpiresAt < now()
 *   - Reset them to:
 *         status = "pending"
 *         lockUserId = null
 *         lockExpiresAt = null
 *
 * This ensures agents cannot hold stale tasks forever.
 *
 * Called by:
 *   - /workers/auto-unlock.worker.ts
 */
export declare function autoUnlockExpiredColdCallEntries(): Promise<number>;
//# sourceMappingURL=auto-unlock.util.d.ts.map