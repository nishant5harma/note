// src/modules/cold-call/analytics/scheduler/aggregate.queue.ts
import { Queue } from "bullmq";
import { getRedisClient } from "../../../../db/redis.js";
export const coldCallAggregateQueue = new Queue("coldcall-aggregate", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis version mismatch with BullMQ
    connection: getRedisClient(),
});
/**
 * Schedule the daily aggregation job.
 * Run this file once on API server startup to ensure the repeating job is registered.
 */
export async function scheduleDailyAggregate() {
    await coldCallAggregateQueue.add("daily-aggregate", {}, {
        repeat: {
            // Cron: 05 00 => 00:05 UTC daily. Adjust to your timezone if required.
            pattern: "5 0 * * *",
        },
        removeOnComplete: true,
        removeOnFail: false,
    });
    console.log("[coldcall] scheduled daily aggregate job (cron: 5 0 * * *)");
}
// schedule immediately when imported by the API server
scheduleDailyAggregate().catch((err) => console.error("Failed to schedule coldcall aggregate job:", err));
//# sourceMappingURL=aggregate.queue.js.map