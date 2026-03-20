// /src/modules/lead/follow-up/follow-up.service.ts
import { prisma } from "../../../db/db.js";
import { getRedisClient } from "../../../db/redis.js";
import { emitToUser } from "../../../modules/socket/socket.service.js";
import { sendPushToUser } from "../../../modules/socket/util-socket/push.sender.js";
import { logAudit } from "../../../utils/audit.util.js";
import { leadStatusLockKey, releaseLock, tryAcquireLock, } from "../../../utils/redis.lock.js";
/**
 * isTerminal - checks if a status is terminal and should free capacity
 */
function isTerminalStatus(s) {
    return ["WON", "LOST", "UNQUALIFIED"].includes(s);
}
/**
 * createFollowUp - create a followup row (no capacity changes)
 */
export async function createFollowUp(leadId, payload, actorId) {
    // create followup row and optionally emit notifications (best-effort)
    const f = await prisma.leadFollowUp.create({
        data: {
            leadId,
            assignedTo: payload.assignedTo ?? null,
            dueAt: payload.dueAt ? new Date(String(payload.dueAt)) : null,
            note: payload.note ?? null,
            disposition: payload.disposition ?? null,
            rating: typeof payload.rating === "number" ? payload.rating : null,
            status: payload.status ?? "pending",
            meta: {
                createdBy: actorId ?? null,
            },
        },
    });
    // audit (best-effort)
    try {
        await logAudit({
            userId: actorId ?? null,
            action: "lead.followup.create",
            resource: "lead",
            resourceId: leadId,
            payload: {
                followupId: f.id,
                assignedTo: f.assignedTo ?? null,
                status: f.status,
                dueAt: f.dueAt ?? null,
            },
        });
    }
    catch (_) { }
    // notify assigned person if provided
    if (payload.assignedTo) {
        try {
            await emitToUser(payload.assignedTo, "followup.created", {
                leadId,
                followupId: f.id,
            });
        }
        catch (_) { }
        try {
            await sendPushToUser(payload.assignedTo, {
                type: "FOLLOWUP_CREATED",
                leadId,
                followupId: f.id,
            });
        }
        catch (_) { }
    }
    return f;
}
/**
 * updateLeadStatus - update lead status/stage/priority atomically. This:
 *  - checks current lead row
 *  - if status becomes terminal, releases capacity for assignedTo (if any)
 *  - updates lead row
 *  - creates a followup note capturing previous state
 *  - creates LeadStageHistory if stage changed
 */
export async function updateLeadStatus(leadId, dto, actorId) {
    const lockKey = leadStatusLockKey(leadId);
    // Acquire lock (returns { acquiredLock, token })
    const { acquiredLock, token } = await tryAcquireLock(lockKey, 10_000);
    if (!acquiredLock || !token) {
        throw new Error("Lead is currently being updated. Please retry.");
    }
    try {
        return await prisma.$transaction(async (tx) => {
            const lead = await tx.lead.findUnique({ where: { id: leadId } });
            if (!lead)
                throw new Error("lead not found");
            const prevStatus = lead.status;
            const prevStage = lead.stage;
            const prevPriority = lead.priority;
            const assignedTo = lead.assignedToId ?? null;
            const willBeTerminal = isTerminalStatus(dto.status);
            const wasTerminal = isTerminalStatus(prevStatus);
            // Capacity release: only once on entering terminal
            if (willBeTerminal && !wasTerminal && assignedTo) {
                await tx.userCapacity.upsert({
                    where: { userId: assignedTo },
                    create: {
                        userId: assignedTo,
                        maxOpen: parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10),
                        used: 0,
                    },
                    update: {},
                });
                const prevCap = await tx.userCapacity.findUnique({
                    where: { userId: assignedTo },
                });
                const newUsed = Math.max(0, (prevCap?.used ?? 0) - 1);
                await tx.userCapacity.update({
                    where: { userId: assignedTo },
                    data: { used: newUsed },
                });
            }
            const updatedLead = await tx.lead.update({
                where: { id: leadId },
                data: {
                    status: dto.status,
                    stage: dto.stage ?? lead.stage,
                    priority: dto.priority ?? lead.priority,
                },
            });
            const meta = {
                previousStatus: prevStatus,
                previousStage: prevStage,
                previousPriority: prevPriority,
                actorId: actorId ?? null,
            };
            const followUp = await tx.leadFollowUp.create({
                data: {
                    leadId,
                    assignedTo,
                    note: dto.note ?? null,
                    disposition: dto.disposition ?? null,
                    rating: typeof dto.rating === "number" ? dto.rating : null,
                    status: "done",
                    meta,
                },
            });
            // Stage history tracking
            if (dto.stage && dto.stage !== prevStage) {
                await tx.leadStageHistory.create({
                    data: {
                        leadId,
                        fromStage: prevStage ?? undefined,
                        toStage: dto.stage,
                        changedBy: actorId ?? null,
                        note: dto.note ?? null,
                    },
                });
            }
            // Notifications
            if (assignedTo) {
                try {
                    await emitToUser(assignedTo, "lead.status.changed", {
                        leadId,
                        status: dto.status,
                    });
                }
                catch (_) { }
                try {
                    await sendPushToUser(assignedTo, {
                        type: "LEAD_STATUS_CHANGED",
                        leadId,
                        status: dto.status,
                    });
                }
                catch (_) { }
            }
            // audit (best-effort; do it inside tx so values match)
            try {
                await tx.auditLog.create({
                    data: {
                        userId: actorId ?? null,
                        action: "lead.status.update",
                        resource: "lead",
                        resourceId: leadId,
                        payload: {
                            from: { status: prevStatus, stage: prevStage, priority: prevPriority },
                            to: { status: dto.status, stage: dto.stage ?? lead.stage, priority: dto.priority ?? lead.priority },
                            followupId: followUp.id,
                        },
                    },
                });
            }
            catch (_) { }
            return { lead: updatedLead, followUp };
        });
    }
    finally {
        // Safe release using token
        await releaseLock(lockKey, token);
    }
}
/**
 * listFollowUps - simple listing with pagination
 */
export async function listFollowUps(leadId, opts) {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.min(200, opts?.limit ?? 50);
    const skip = (page - 1) * limit;
    const items = await prisma.leadFollowUp.findMany({
        where: { leadId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
    });
    const total = await prisma.leadFollowUp.count({ where: { leadId } });
    return { items, meta: { total, page, limit } };
}
/**
 * Admin / analytics helpers:
 * - list by disposition, export CSV (stub)
 * - stage funnel counts
 * - ratings aggregation (by org/team/user)
 */
export async function listFollowUpsByFilter(filter) {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(500, filter.limit ?? 100);
    const where = {};
    if (filter.disposition)
        where.disposition = { contains: filter.disposition, mode: "insensitive" };
    if (filter.assignedTo)
        where.assignedTo = filter.assignedTo;
    if (filter.from || filter.to) {
        where.createdAt = {};
        if (filter.from)
            where.createdAt.gte = new Date(filter.from);
        if (filter.to)
            where.createdAt.lte = new Date(filter.to);
    }
    const items = await prisma.leadFollowUp.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
    });
    const total = await prisma.leadFollowUp.count({ where });
    return { items, meta: { total, page, limit } };
}
/**
 * stageFunnel - returns counts per stage (for UI charts)
 * optionally scoped by teamId or userId advantage
 */
export async function stageFunnel(scope) {
    const where = {};
    if (scope?.teamId)
        where.assignedTeamId = scope.teamId;
    if (scope?.userId)
        where.assignedToId = scope.userId;
    // Use Prisma's groupBy instead of raw SQL
    const rows = await prisma.lead.groupBy({
        by: ["stage"],
        _count: { stage: true },
        where,
    });
    // Normalize output to your expected shape
    return rows.map((r) => ({
        stage: r.stage,
        count: r._count.stage,
    }));
}
/**
 * ratingsAggregation - returns avg rating and counts grouped by stage or user/team
 */
export async function ratingsAggregation(scope) {
    const group = scope?.groupBy ?? "stage";
    if (group === "stage") {
        const rows = await prisma.$queryRaw `SELECT l.stage as stage, AVG(f.rating) as "avgRating", COUNT(f.*) as cnt
       FROM "LeadFollowUp" f
       JOIN "Lead" l ON f."leadId" = l.id
       WHERE f.rating IS NOT NULL
       GROUP BY l.stage`;
        return rows;
    }
    return [];
}
export async function listLeadStageHistory(leadId) {
    return prisma.leadStageHistory.findMany({
        where: { leadId },
        orderBy: { createdAt: "asc" },
    });
}
//# sourceMappingURL=follow-up.service.js.map