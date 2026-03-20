// src/modules/cold-call/queue/retry.queue.ts
import { Queue } from "bullmq";
import { getRedisClient } from "@/db/redis.js";

export const coldCallRetryQueue = new Queue("coldcall-retry", {
  connection: getRedisClient(),
});

export async function scheduleRetry(entryId: string, retryAt: Date) {
  await coldCallRetryQueue.add(
    "retry-entry",
    { entryId },
    {
      delay: retryAt.getTime() - Date.now(),
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
