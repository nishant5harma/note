// src/modules/lead/assignment/queue/queue.ts
import { Queue } from "bullmq"; // Removed QueueScheduler
import { getRedisClient } from "../../../../db/redis.js";
// -- Configuration --
const connection = getRedisClient();
// -- Constants --
export const ASSIGNMENT_QUEUE_NAME = process.env.BULLMQ_PREFIX
    ? `${process.env.BULLMQ_PREFIX}assignment`
    : "lead-assignment";
export const ASSIGNMENT_CHECK_QUEUE_NAME = process.env.BULLMQ_PREFIX
    ? `${process.env.BULLMQ_PREFIX}assignment-check`
    : "lead-assignment-check";
export const ESCALATION_QUEUE_NAME = process.env.BULLMQ_PREFIX
    ? `${process.env.BULLMQ_PREFIX}escalation`
    : "lead-escalation";
export const TEAM_ASSIGNMENT_QUEUE_NAME = process.env.BULLMQ_PREFIX
    ? `${process.env.BULLMQ_PREFIX}team-assignment`
    : "lead-team-assignment";
// -- Queues --
export const assignmentQueue = new Queue(ASSIGNMENT_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
    },
});
export const assignmentCheckQueue = new Queue(ASSIGNMENT_CHECK_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
    },
});
export const escalationQueue = new Queue(ESCALATION_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 50,
    },
});
export const teamAssignmentQueue = new Queue(TEAM_ASSIGNMENT_QUEUE_NAME, {
    connection,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: 50 },
});
// -- Exported Helpers --
/**
 * Enqueue an assignment check (delayed) with optional delayMs.
 * Returns jobId (string) so callers can persist/cancel it if needed.
 *
 * Use Case:
 *  - this allows for any immediate manual assignments to occur first
 *  - also helps db to settle in case of high concurrency and tx delays
 *  - helps workers to not immediately pick up the job and avoid failing unable to data in db
 */
export async function enqueueAssignmentCheckJob(leadId, assignmentId, opts) {
    const delay = opts?.delayMs ?? 0;
    const jobId = `check-${assignmentId}-${Date.now()}`;
    const job = await assignmentCheckQueue.add("assignment-check", { leadId, assignmentId, attempt: opts?.attempt ?? 0 }, { delay, jobId });
    return String(job.id);
}
/**
 * Enqueue a fresh assignment job (immediate)
 * Returns jobId so caller can persist it to DB (LeadAssignment.meta.jobId)
 */
export async function enqueueAssignmentJob(leadId, assignmentId) {
    const jobId = `assign-${assignmentId}`;
    const job = await assignmentQueue.add("assign-lead", { leadId, assignmentId, attempt: 0 }, { jobId });
    return String(job.id);
}
//# sourceMappingURL=queue.js.map