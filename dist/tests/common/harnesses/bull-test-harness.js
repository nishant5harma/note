// /src/tests/common/harnesses/bull-test-harness.ts
import { QueueEvents } from "bullmq";
import { getRedisClient } from "../../../db/redis.js";
export async function waitForJobCompletion(q, timeout = 5000) {
    const jobEvents = new QueueEvents(q.name, { connection: getRedisClient() });
    return new Promise((resolve, reject) => {
        const to = setTimeout(() => {
            jobEvents.close().catch(() => { });
            reject(new Error("Timeout waiting for job"));
        }, timeout);
        jobEvents.on("completed", async ({ jobId }) => {
            clearTimeout(to);
            await jobEvents.close();
            resolve();
        });
        jobEvents.on("failed", async ({ jobId, failedReason }) => {
            clearTimeout(to);
            await jobEvents.close();
            reject(new Error(`Job failed: ${failedReason}`));
        });
    });
}
//# sourceMappingURL=bull-test-harness.js.map