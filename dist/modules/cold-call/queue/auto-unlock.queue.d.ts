/**
 * Cold Call Auto-Unlock — Queue Scheduler
 * ---------------------------------------
 * This file is imported ONCE on API server startup.
 *
 * Purpose:
 *   - Register a repeating BullMQ job named "coldcall-auto-unlock".
 *   - The job runs every 60 seconds.
 *   - Worker processes will pick up the job and execute the unlock logic.
 *
 * Why a dedicated file?
 *   - Avoid scheduling jobs multiple times.
 *   - Clean separation between "queue scheduler" (API server)
 *     and "queue worker" (worker process).
 *
 * Usage:
 *   1) API server must import this file ONCE:
 *        import "../../../modules/cold-call/queue/auto-unlock.queue.js"
 *
 *   2) Worker process must run:
 *        node dist/modules/cold-call/workers/auto-unlock.worker.js
 *
 * Do NOT import this file in workers — only in API server.
 */
import { Queue } from "bullmq";
export declare const coldCallAutoUnlockQueue: Queue<any, any, string, any, any, string>;
//# sourceMappingURL=auto-unlock.queue.d.ts.map