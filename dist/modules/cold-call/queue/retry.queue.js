// src/modules/cold-call/queue/retry.queue.ts
import { Queue } from "bullmq";
import { getRedisClient } from "../../../db/redis.js";
export const coldCallRetryQueue = new Queue("coldcall-retry", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis version mismatch with BullMQ
    connection: getRedisClient(),
});
export async function scheduleRetry(entryId, retryAt) {
    await coldCallRetryQueue.add("retry-entry", { entryId }, {
        delay: retryAt.getTime() - Date.now(),
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: false,
    });
}
//# sourceMappingURL=retry.queue.js.map