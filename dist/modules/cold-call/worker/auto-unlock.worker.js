// /src/modules/cold-call/workers/auto-unlock.worker.ts
/**
 * Cold Call Auto-Unlock — Worker Process
 * --------------------------------------
 *
 * This file MUST be executed in a dedicated Worker environment
 * (not inside the API server).
 *
 * Purpose:
 *   - Listen to the "coldcall-auto-unlock" queue.
 *   - Invoke autoUnlockExpiredColdCallEntries() each time BullMQ pushes a job.
 *
 * Run this separately:
 *   node dist/modules/cold-call/workers/auto-unlock.worker.js
 *
 * Works with:
 *   - Queue scheduler in: queue/auto-unlock.queue.ts
 *   - Logic in: agent/util/auto-unlock.util.ts
 */
import { Worker } from "bullmq";
import { getRedisClient } from "../../../db/redis.js";
import { autoUnlockExpiredColdCallEntries } from "../../../modules/cold-call/agent/util/auto-unlock.util.js";
/* ------------------------------------------------------------------ */
/* PURE LOGIC (TESTABLE)                                               */
/* ------------------------------------------------------------------ */
export async function runAutoUnlock() {
    await autoUnlockExpiredColdCallEntries();
}
/* ------------------------------------------------------------------ */
/* WORKER REGISTRATION (RUNTIME ONLY)                                  */
/* ------------------------------------------------------------------ */
let coldCallAutoUnlockWorker = null;
if (process.env.NODE_ENV !== "test") {
    coldCallAutoUnlockWorker = new Worker("coldcall-auto-unlock", async () => {
        await runAutoUnlock();
    }, {
        connection: getRedisClient(),
    });
    coldCallAutoUnlockWorker.on("completed", () => {
        console.log("[coldcall] auto-unlock job completed");
    });
    coldCallAutoUnlockWorker.on("failed", (job, err) => {
        console.error("[coldcall] auto-unlock job FAILED:", err);
    });
}
export { coldCallAutoUnlockWorker };
//# sourceMappingURL=auto-unlock.worker.js.map