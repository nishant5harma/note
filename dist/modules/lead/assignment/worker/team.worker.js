// src/modules/lead/assignment/team.worker.ts
import { Worker } from "bullmq";
import { enqueueAssignmentCheckJob, TEAM_ASSIGNMENT_QUEUE_NAME, teamAssignmentQueue, } from "../queue/queue.js";
import { getRedisClient } from "../../../../db/redis.js";
import { prisma } from "../../../../db/db.js";
import { tryAcquireLock, releaseLock } from "../../../../utils/redis.lock.js";
import { claimUserCapacity } from "../helper-services/capacity.service.js";
const connection = getRedisClient();
export function startTeamAssignmentWorker() {
    const concurrency = Math.max(1, Math.floor(parseInt(process.env.LEAD_ASSIGN_WORKER_CONCURRENCY ?? "4", 10) / 2));
    const worker = new Worker(TEAM_ASSIGNMENT_QUEUE_NAME, async (job) => {
        const { leadId, assignmentId, teamId } = job.data;
        // load lead & assignment
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        const assignRow = await prisma.leadAssignment.findUnique({
            where: { id: assignmentId },
        });
        if (!lead || !assignRow)
            return;
        // get team members (ordered by joinedAt for deterministic order)
        const members = await prisma.teamMember.findMany({
            where: { teamId },
            include: { user: true },
            orderBy: { joinedAt: "asc" },
        });
        if (!members || members.length === 0) {
            // nothing to do, let normal assignment handler requeue/escalate
            return;
        }
        const redis = getRedisClient();
        // Advance pointer once and compute start index deterministically
        const rrKey = `lead:rr:team:${teamId}`;
        const raw = await redis.incr(rrKey); // using redis directly to mirror RoundRobinStrategy pointer
        const startIdx = (((raw - 1) % members.length) + members.length) % members.length;
        // iterate once deterministically in offset order
        for (let i = 0; i < members.length; i++) {
            const idx = (startIdx + i) % members.length;
            const selected = members[idx];
            if (!selected)
                continue;
            const userId = selected.userId;
            // lead lock
            const lockKey = `lead:assign:lock:lead:${lead.id}`;
            const { acquiredLock, token } = await tryAcquireLock(lockKey, 15000);
            if (!acquiredLock) {
                // retry later: increment attempt and return
                await prisma.leadAssignment.update({
                    where: { id: assignmentId },
                    data: { attempt: assignRow.attempt + 1 },
                });
                return;
            }
            try {
                // re-check lead assigned
                const fresh = await prisma.lead.findUnique({
                    where: { id: lead.id },
                });
                if (!fresh || fresh.assignedToId)
                    return;
                // Try DB claim
                const claimed = await claimUserCapacity(userId);
                if (!claimed) {
                    // try next candidate
                    continue;
                }
                // assign in transaction and update assignment row
                await prisma.$transaction(async (tx) => {
                    await tx.lead.update({
                        where: { id: lead.id },
                        data: {
                            assignedToId: userId,
                            assignedAt: new Date(),
                            assignedTeamId: teamId,
                        },
                    });
                    await tx.leadAssignment.update({
                        where: { id: assignmentId },
                        data: {
                            assignedTo: userId,
                            assignedBy: "system",
                            method: "team_auto",
                            attempt: assignRow.attempt + 1,
                        },
                    });
                });
                // notify user (emit/push) - keep best-effort; using your existing functions
                try {
                    /* emit & push using your existing send functions */
                }
                catch (e) {
                    /* ignore */
                }
                return;
            }
            finally {
                await releaseLock(lockKey, token);
            }
        }
        // if loop finished and no one claimed, increase attempt & requeue to check queue (handler's logic will escalate if needed)
        await prisma.leadAssignment.update({
            where: { id: assignmentId },
            data: { attempt: assignRow.attempt + 1 },
        });
        // requeue into assignment-check for backoff (reuse helper)
        const base = parseInt(process.env.LEAD_ASSIGN_BASE_DELAY_MS ?? "15000", 10);
        const maxDelay = parseInt(process.env.LEAD_ASSIGN_MAX_DELAY_MS ?? "600000", 10);
        const delay = Math.min(maxDelay, base * Math.pow(2, assignRow.attempt));
        const checkJobId = await enqueueAssignmentCheckJob(lead.id, assignmentId, { delayMs: delay, attempt: assignRow.attempt + 1 });
        // persist check job id into meta for dedupe/cancel later
        try {
            const prevMeta = assignRow.meta ?? {};
            const newMeta = {
                ...prevMeta,
                checkJobId,
                lastEnqueuedAt: new Date().toISOString(),
                nextTryAt: new Date(Date.now() + delay).toISOString(),
            };
            await prisma.leadAssignment.update({
                where: { id: assignmentId },
                data: { meta: newMeta },
            });
        }
        catch (e) {
            // best-effort: don't crash worker if meta update fails
            console.warn("team.worker: failed to persist checkJobId meta", e);
        }
    }, { connection, concurrency });
    worker.on("failed", (job, err) => {
        console.error("Team assignment worker failed", job?.id, err);
    });
    console.log("Team assignment worker started (concurrency=", concurrency, ")");
}
//# sourceMappingURL=team.worker.js.map