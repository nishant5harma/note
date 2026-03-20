// src/modules/lead/assignment/worker/worker.ts
import { Worker } from "bullmq";
import { ASSIGNMENT_QUEUE_NAME, ASSIGNMENT_CHECK_QUEUE_NAME, } from "../queue/queue.js";
import { assignmentJobHandler } from "../helper-services/handler.service.js";
import { getRedisClient } from "../../../../db/redis.js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis version mismatch with BullMQ
const connection = getRedisClient();
export function startAssignmentWorkers() {
    const concurrency = parseInt(process.env.LEAD_ASSIGN_WORKER_CONCURRENCY ?? "4", 10);
    // main assignment worker
    const worker = new Worker(ASSIGNMENT_QUEUE_NAME, async (job) => await assignmentJobHandler(job.data), { connection, concurrency });
    // check (delayed) worker
    const checkWorker = new Worker(ASSIGNMENT_CHECK_QUEUE_NAME, async (job) => await assignmentJobHandler(job.data), { connection, concurrency: Math.max(1, Math.floor(concurrency / 2)) });
    worker.on("failed", (job, err) => {
        console.error("Assignment worker failed job", job?.id, err);
    });
    checkWorker.on("failed", (job, err) => {
        console.error("Assignment check worker failed job", job?.id, err);
    });
    console.log(`Started assignment workers (concurrency=${concurrency})`);
}
//# sourceMappingURL=worker.js.map