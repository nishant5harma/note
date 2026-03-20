// /src/modules/cold-call/worker/retry.worker.ts
import { Worker } from "bullmq";
import { getRedisClient } from "../../../db/redis.js";
import { prisma } from "../../../db/db.js";
/* ------------------------------------------------------------------ */
/* PURE LOGIC (TESTABLE)                                               */
/* ------------------------------------------------------------------ */
export async function runRetry(entryId) {
    await prisma.coldCallEntry.update({
        where: { id: entryId },
        data: {
            status: "pending",
            lockUserId: null,
            lockExpiresAt: null,
            response: null,
            disposition: null,
        },
    });
}
/* ------------------------------------------------------------------ */
/* WORKER REGISTRATION (RUNTIME ONLY)                                  */
/* ------------------------------------------------------------------ */
let coldCallRetryWorker = null;
if (process.env.NODE_ENV !== "test") {
    coldCallRetryWorker = new Worker("coldcall-retry", async (job) => {
        await runRetry(job.data.entryId);
    }, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ioredis version mismatch with BullMQ
        connection: getRedisClient(),
    });
    coldCallRetryWorker.on("completed", () => {
        console.log("[coldcall] retry job completed");
    });
    coldCallRetryWorker.on("failed", (job, err) => {
        console.error("[coldcall] retry job FAILED:", err);
    });
}
export { coldCallRetryWorker };
//# sourceMappingURL=retry.worker.js.map