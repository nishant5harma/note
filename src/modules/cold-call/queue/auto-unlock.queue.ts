// /src/modules/cold-call/queue/auto-unlock.queue.ts
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
 *        import "@/modules/cold-call/queue/auto-unlock.queue.js"
 *
 *   2) Worker process must run:
 *        node dist/modules/cold-call/workers/auto-unlock.worker.js
 *
 * Do NOT import this file in workers — only in API server.
 */

import { Queue } from "bullmq";
import { getRedisClient } from "@/db/redis.js";

// Queue name MUST match worker name for BullMQ to deliver jobs correctly.
export const coldCallAutoUnlockQueue = new Queue("coldcall-auto-unlock", {
  connection: getRedisClient(),
});

// Schedule repeating job (runs every 60 seconds)
async function scheduleAutoUnlock() {
  await coldCallAutoUnlockQueue.add(
    "auto-unlock-task", // job name
    {}, // no payload needed
    {
      repeat: {
        every: 60_000, // interval in ms
      },
    }
  );

  console.log("[coldcall] auto-unlock repeating job scheduled (every 60s)");
}

// Immediately schedule when this file is imported by API server
scheduleAutoUnlock().catch((err) =>
  console.error("Failed to schedule coldcall auto-unlock job:", err)
);
