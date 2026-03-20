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
export declare function runAutoUnlock(): Promise<void>;
declare let coldCallAutoUnlockWorker: Worker | null;
export { coldCallAutoUnlockWorker };
//# sourceMappingURL=auto-unlock.worker.d.ts.map