import { enqueueAssignmentJob } from "./queue/queue.js";
import { prisma } from "../../../db/db.js";
import { assignmentQueue, assignmentCheckQueue, teamAssignmentQueue, } from "./queue/queue.js";
/**
 * Called by intake after creating Lead + LeadAssignment rows.
 * Accepts leadId and assignmentId (the leadAssignment row).
 */
export async function enqueueInitialAssignment(leadId, assignmentId) {
    // Basic sanity check: ensure assignment exists
    const a = await prisma.leadAssignment.findUnique({
        where: { id: assignmentId },
    });
    if (!a)
        throw new Error("assignment not found");
    const jobId = await enqueueAssignmentJob(leadId, assignmentId);
    // Persist jobId into LeadAssignment.meta for later cancellation/inspection
    const existingMeta = a.meta ?? {};
    const newMeta = { ...existingMeta, jobId };
    await prisma.leadAssignment.update({
        where: { id: assignmentId },
        data: { meta: newMeta },
    });
}
/**
 * Manual assign: used by API to manually assign a lead to a user.
 * This also updates LeadAssignment as audit trail.
 *
 * Behavior enhancements:
 *  - cancels pending queue jobs referenced in LeadAssignment.meta (jobId/checkJobId/teamJobId)
 *  - atomically updates capacity.used counters (decrement old, increment new)
 */
export async function manualAssignLead(leadId, assignmentId, userId, actorId) {
    // Fetch existing assignment row (if provided) for meta & prior assigned user
    const assignRow = assignmentId
        ? await prisma.leadAssignment.findUnique({ where: { id: assignmentId } })
        : null;
    // If we have meta job ids in assignment row, attempt to cancel them from queues
    try {
        if (assignRow?.meta) {
            const meta = assignRow.meta;
            const toRemove = [];
            if (meta?.jobId)
                toRemove.push(meta.jobId);
            if (meta?.checkJobId)
                toRemove.push(meta.checkJobId);
            if (meta?.teamJobId)
                toRemove.push(meta.teamJobId);
            for (const jobId of toRemove) {
                try {
                    // Try to remove from known queues
                    const qCandidates = [
                        assignmentQueue,
                        assignmentCheckQueue,
                        teamAssignmentQueue,
                    ];
                    for (const q of qCandidates) {
                        try {
                            const job = await q.getJob(jobId);
                            if (job) {
                                await job.remove();
                            }
                        }
                        catch (e) {
                            // ignore per-queue errors
                        }
                    }
                }
                catch (e) {
                    // ignore job removal errors
                }
            }
        }
    }
    catch (e) {
        // best-effort - do not block manual assign on job removal failure
        console.warn("manualAssignLead: job removal best-effort failure", e);
    }
    // Perform transactional updates:
    // - update Lead.assignedToId/assignedAt
    // - update/create LeadAssignment row
    // - decrement previous user capacity (if any) and increment new user capacity
    await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.findUnique({ where: { id: leadId } });
        if (!lead)
            throw new Error("lead not found");
        const prevUserId = lead.assignedToId ?? null;
        // Update lead to point to new assignee
        await tx.lead.update({
            where: { id: leadId },
            data: {
                assignedToId: userId,
                assignedAt: new Date(),
                assignedTeamId: null,
            },
        });
        // Update assignment row or create a manual assignment row
        if (assignmentId) {
            await tx.leadAssignment.update({
                where: { id: assignmentId },
                data: {
                    assignedTo: userId,
                    assignedBy: actorId,
                    method: "manual",
                    attempt: { increment: 1 },
                    meta: {
                        ...(assignRow?.meta ?? {}),
                        manualAssignedAt: new Date().toISOString(),
                    },
                },
            });
        }
        else {
            await tx.leadAssignment.create({
                data: {
                    leadId,
                    assignedTo: userId,
                    assignedBy: actorId,
                    method: "manual",
                    attempt: 1,
                    meta: { manualAssignedAt: new Date().toISOString() },
                },
            });
        }
        // Capacity adjustments (best-effort but transactional)
        // Ensure capacity rows exist using upsert
        await tx.userCapacity.upsert({
            where: { userId },
            update: {},
            create: {
                userId,
                maxOpen: parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10),
                used: 0,
            },
        });
        // Increment capacity used for new user
        await tx.userCapacity.update({
            where: { userId },
            data: { used: { increment: 1 } },
        });
        // Decrement capacity used for previous user (if different)
        if (prevUserId && prevUserId !== userId) {
            // ensure row exists then decrement safely
            await tx.userCapacity.upsert({
                where: { userId: prevUserId },
                update: {},
                create: {
                    userId: prevUserId,
                    maxOpen: parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10),
                    used: 0,
                },
            });
            const prev = await tx.userCapacity.findUnique({
                where: { userId: prevUserId },
            });
            const newUsed = Math.max(0, (prev?.used ?? 0) - 1);
            await tx.userCapacity.update({
                where: { userId: prevUserId },
                data: { used: newUsed },
            });
        }
    });
    // TODO: audit placeholder -> logAudit({ action: 'lead.assign.manual', actorId, leadId, targetUserId: userId })
}
//# sourceMappingURL=assignment.service.js.map