// /src/modules/cold-call/agent/util/auto-unlock.util.ts
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

import { prisma } from "@/db/db.js";

export async function autoUnlockExpiredColdCallEntries() {
  const now = new Date();

  const result = await prisma.coldCallEntry.updateMany({
    where: {
      status: "in_progress",
      lockUserId: { not: null },
      lockExpiresAt: { lt: now },
    },
    data: {
      lockUserId: null,
      lockExpiresAt: null,
      status: "pending",
    },
  });

  console.log(
    `[coldcall] auto-unlock: released ${result.count} expired locked entries`
  );

  return result.count;
}
