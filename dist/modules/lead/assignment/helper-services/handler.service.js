// src/modules/lead/assignment/helper-services/handler.service.ts
import { prisma } from "../../../../db/db.js";
import { tryAcquireLock, releaseLock } from "../../../../utils/redis.lock.js";
import { enqueueAssignmentCheckJob, escalationQueue, teamAssignmentQueue, } from "../queue/queue.js";
import { RoundRobinStrategy } from "../strategies/round-robin.js";
import { CapacityDecorator } from "../strategies/capacity.decorator.js";
import { emitToUser } from "../../../../modules/socket/socket.service.js";
import { sendPushToUser } from "../../../../modules/socket/util-socket/push.sender.js";
import { claimUserCapacity, releaseUserCapacity } from "./capacity.service.js"; // DB-transactional capacity helpers
// export handler for workers
export async function assignmentJobHandler(data) {
    const { leadId, assignmentId } = data;
    // Load assignment row
    const assignRow = await prisma.leadAssignment.findUnique({
        where: { id: assignmentId },
    });
    if (!assignRow) {
        console.warn("assignment handler: LeadAssignment not found", assignmentId);
        return;
    }
    // If already assigned -> idempotent success
    if (assignRow.assignedTo) {
        console.log("assignment handler: already assigned, skipping", assignmentId);
        return;
    }
    // load lead
    const lead = await prisma.lead.findUnique({
        where: { id: assignRow.leadId },
    });
    if (!lead) {
        console.warn("assignment handler: lead not found", assignRow.leadId);
        return;
    }
    // Idempotency / early exit if lead already assigned
    if (lead.assignedToId) {
        console.log("lead already assigned by another worker; marking assignment row", lead.id);
        await prisma.leadAssignment.update({
            where: { id: assignRow.id },
            data: {
                assignedTo: lead.assignedToId,
                assignedBy: "concurrent",
                attempt: assignRow.attempt + 1,
            },
        });
        return;
    }
    // Choose strategy. For MVP: per-source -> round-robin -> capacity decorator
    const baseStrategy = new RoundRobinStrategy();
    const strategy = new CapacityDecorator(baseStrategy);
    // let strategy pick candidate(s)
    const candidate = await strategy.pickCandidate({
        lead,
        assignment: assignRow,
    });
    if (!candidate) {
        // update attempt count and requeue or escalate
        const nextAttempt = assignRow.attempt + 1;
        // compute backoff delay
        const base = parseInt(process.env.LEAD_ASSIGN_BASE_DELAY_MS ?? "15000", 10);
        const maxDelay = parseInt(process.env.LEAD_ASSIGN_MAX_DELAY_MS ?? "600000", 10);
        const delay = Math.min(maxDelay, base * Math.pow(2, nextAttempt - 1));
        // persist attempt and metadata in one operation
        const prevMeta = assignRow.meta ?? {};
        const newMeta = {
            ...prevMeta,
            lastAttemptAt: new Date().toISOString(),
            nextTryAt: new Date(Date.now() + delay).toISOString(),
        };
        await prisma.leadAssignment.update({
            where: { id: assignRow.id },
            data: { attempt: nextAttempt, meta: newMeta },
        });
        const maxAttempts = parseInt(process.env.LEAD_ASSIGN_MAX_ATTEMPTS ?? "10", 10);
        if (nextAttempt >= maxAttempts) {
            // escalate
            await prisma.lead.update({
                where: { id: lead.id },
                data: { status: "UNASSIGNED_ESCALATED" },
            });
            // enqueue escalation job (light payload)
            await escalationQueue.add("escalate", {
                leadId: lead.id,
                assignmentId: assignRow.id,
            });
            // TODO: audit placeholder
            // TODO: metrics placeholder
            console.log("lead escalated", lead.id);
            return;
        }
        // schedule re-check (exponential backoff with cap)
        const checkJobId = await enqueueAssignmentCheckJob(lead.id, assignRow.id, {
            delayMs: delay,
            attempt: nextAttempt,
        });
        // persist checkJobId into assignment meta so it can be cancelled/deduped
        try {
            const persistedMeta = {
                ...newMeta,
                checkJobId,
                lastEnqueuedAt: new Date().toISOString(),
            };
            await prisma.leadAssignment.update({
                where: { id: assignRow.id },
                data: { meta: persistedMeta },
            });
        }
        catch (e) {
            console.warn("assignment handler: failed to persist checkJobId meta", e);
        }
        console.log("no candidate found; requeued with delay", delay, "attempt", nextAttempt);
        return;
    }
    // Candidate handling
    if (candidate.type === "user") {
        const userId = candidate.userId;
        const lockKey = `lead:assign:lock:lead:${lead.id}`;
        // Acquire per-lead lock to avoid races
        const { acquiredLock, token } = await tryAcquireLock(lockKey, 20000);
        if (!acquiredLock) {
            console.log("couldn't acquire lead lock, requeueing", lead.id);
            const checkJobId = await enqueueAssignmentCheckJob(lead.id, assignRow.id, {
                delayMs: 2000,
                attempt: assignRow.attempt + 1,
            });
            // persist checkJobId into meta
            try {
                const prevMeta = assignRow.meta ?? {};
                const persistedMeta = {
                    ...prevMeta,
                    checkJobId,
                    lastEnqueuedAt: new Date().toISOString(),
                    nextTryAt: new Date(Date.now() + 2000).toISOString(),
                };
                await prisma.leadAssignment.update({
                    where: { id: assignRow.id },
                    data: { meta: persistedMeta },
                });
            }
            catch (e) {
                // best-effort
            }
            return;
        }
        let claimed = false;
        try {
            // Double-check that lead is still unassigned
            const freshLead = await prisma.lead.findUnique({
                where: { id: lead.id },
            });
            if (!freshLead || freshLead.assignedToId) {
                console.log("lead already assigned after lock", lead.id);
                await prisma.leadAssignment.update({
                    where: { id: assignRow.id },
                    data: {
                        assignedTo: freshLead?.assignedToId ?? null,
                        assignedBy: "concurrent",
                        attempt: assignRow.attempt + 1,
                    },
                });
                return;
            }
            // Claim capacity for user atomically (DB conditional update)
            claimed = await claimUserCapacity(userId);
            if (!claimed) {
                // user has no capacity now, increment attempt and requeue
                const nextAttempt = assignRow.attempt + 1;
                const delay = 5000;
                const prevMeta = assignRow.meta ?? {};
                const newMeta = {
                    ...prevMeta,
                    lastAttemptAt: new Date().toISOString(),
                    nextTryAt: new Date(Date.now() + delay).toISOString(),
                };
                await prisma.leadAssignment.update({
                    where: { id: assignRow.id },
                    data: { attempt: nextAttempt, meta: newMeta },
                });
                const checkJobId = await enqueueAssignmentCheckJob(lead.id, assignRow.id, {
                    delayMs: delay,
                    attempt: nextAttempt,
                });
                // persist checkJobId
                try {
                    const persistedMeta = {
                        ...newMeta,
                        checkJobId,
                        lastEnqueuedAt: new Date().toISOString(),
                    };
                    await prisma.leadAssignment.update({
                        where: { id: assignRow.id },
                        data: { meta: persistedMeta },
                    });
                }
                catch (e) {
                    // ignore
                }
                return;
            }
            // perform DB transaction to set assigned user & assignment row
            await prisma.$transaction(async (tx) => {
                await tx.lead.update({
                    where: { id: lead.id },
                    data: {
                        assignedToId: userId,
                        assignedAt: new Date(),
                        assignedTeamId: lead.assignedTeamId ?? null,
                    },
                });
                await tx.leadAssignment.update({
                    where: { id: assignRow.id },
                    data: {
                        assignedTo: userId,
                        assignedBy: "system",
                        method: "auto",
                        attempt: assignRow.attempt + 1,
                        meta: {
                            strategy: "perSourceThenRoundRobin+capacity",
                            assignedAt: new Date().toISOString(),
                        },
                    },
                });
            });
            // notify user: socket + push
            try {
                await emitToUser(userId, "lead.assigned", { leadId: lead.id });
            }
            catch (e) {
                console.warn("emitToUser failed", e);
            }
            try {
                await sendPushToUser(userId, {
                    type: "LEAD_ASSIGNED",
                    leadId: lead.id,
                });
            }
            catch (e) {
                console.warn("sendPushToUser failed", e);
            }
            // TODO: audit placeholder -> logAudit({ action: 'lead.assign', ... })
            // TODO: metrics increment
            console.log("lead assigned", lead.id, "->", userId);
            return;
        }
        catch (err) {
            // If we claimed capacity but failed during transaction, release the claim
            if (claimed) {
                try {
                    await releaseUserCapacity(userId);
                }
                catch (releaseErr) {
                    console.warn("failed releasing capacity after error", releaseErr);
                }
            }
            console.error("assignment handler error (user candidate):", err);
            // requeue with small delay to retry
            const nextAttempt = assignRow.attempt + 1;
            const delay = 5000;
            const checkJobId = await enqueueAssignmentCheckJob(lead.id, assignRow.id, {
                delayMs: delay,
                attempt: nextAttempt,
            });
            // persist checkJobId & meta
            try {
                const prevMeta = assignRow.meta ?? {};
                const persistedMeta = {
                    ...prevMeta,
                    checkJobId,
                    lastEnqueuedAt: new Date().toISOString(),
                    nextTryAt: new Date(Date.now() + delay).toISOString(),
                    lastAttemptAt: new Date().toISOString(),
                };
                await prisma.leadAssignment.update({
                    where: { id: assignRow.id },
                    data: { meta: persistedMeta },
                });
            }
            catch (e) {
                // best-effort
            }
            return;
        }
        finally {
            await releaseLock(lockKey, token);
        }
    }
    if (candidate.type === "team") {
        // assign to team queue / set assignedTeamId
        const teamId = candidate.teamId;
        await prisma.lead.update({
            where: { id: lead.id },
            data: { assignedTeamId: teamId },
        });
        // create/update assignment row
        await prisma.leadAssignment.update({
            where: { id: assignRow.id },
            data: {
                assignedTo: null,
                assignedBy: "system",
                method: "team_pool",
                attempt: assignRow.attempt + 1,
                meta: { teamId },
            },
        });
        // enqueue team assignment job
        const job = await teamAssignmentQueue.add("team-assign", { leadId: lead.id, assignmentId: assignRow.id, teamId }, { jobId: `team:${assignRow.id}:${Date.now()}` });
        // persist team job id in meta
        try {
            const prevMeta = assignRow.meta ?? {};
            const newMeta = {
                ...prevMeta,
                teamJobId: String(job.id),
                lastEnqueuedAt: new Date().toISOString(),
            };
            await prisma.leadAssignment.update({
                where: { id: assignRow.id },
                data: { meta: newMeta },
            });
        }
        catch (e) {
            // best-effort
        }
        // TODO: audit placeholder
        return;
    }
    // fallback
    console.warn("unexpected candidate type", candidate);
}
//# sourceMappingURL=handler.service.js.map