import { prisma } from "../../db/db.js";
import { BadRequestError, NotFoundError } from "../../utils/http-errors.util.js";
function parseOptionalDateIso(v) {
    if (!v)
        return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime()))
        throw new BadRequestError("Invalid date");
    return d;
}
export const LeadService = {
    listLeads,
    getLeadById,
};
async function listLeads(params) {
    const { page, limit, q, source, status, stage, priority, assignedToId, assignedTeamId, from, to, } = params;
    const createdAtGte = parseOptionalDateIso(from);
    const createdAtLte = parseOptionalDateIso(to);
    const where = {};
    if (source)
        where.source = source;
    if (status)
        where.status = status;
    if (stage)
        where.stage = stage;
    if (priority)
        where.priority = priority;
    if (assignedToId)
        where.assignedToId = assignedToId;
    if (assignedTeamId)
        where.assignedTeamId = assignedTeamId;
    if (createdAtGte || createdAtLte) {
        where.createdAt = {};
        if (createdAtGte)
            where.createdAt.gte = createdAtGte;
        if (createdAtLte)
            where.createdAt.lte = createdAtLte;
    }
    if (q) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { externalId: { contains: q, mode: "insensitive" } },
        ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
        prisma.lead.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
                id: true,
                externalId: true,
                source: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                stage: true,
                priority: true,
                assignedToId: true,
                assignedTeamId: true,
                assignedAt: true,
                createdAt: true,
                updatedAt: true,
                assignedTeam: { select: { id: true, name: true, teamLeadId: true } },
                assignments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { id: true, assignedTo: true, assignedBy: true, method: true, attempt: true, meta: true, createdAt: true },
                },
                webhookEvents: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    select: { id: true, provider: true, externalId: true, dedupeHash: true, createdAt: true },
                },
                _count: { select: { followUps: true, notes: true, escalations: true } },
            },
        }),
        prisma.lead.count({ where }),
    ]);
    return {
        ok: true,
        items,
        meta: { page, limit, total },
    };
}
async function getLeadById(id) {
    if (!id)
        throw new BadRequestError("Lead ID is required");
    const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
            assignedTeam: true,
            assignments: { orderBy: { createdAt: "desc" } },
            webhookEvents: { orderBy: { createdAt: "desc" } },
            notes: { orderBy: { createdAt: "desc" } },
            followUps: { orderBy: { createdAt: "desc" } },
            stageHistory: { orderBy: { createdAt: "asc" } },
            escalations: { orderBy: { createdAt: "desc" } },
        },
    });
    if (!lead)
        throw new NotFoundError("Lead not found");
    return { ok: true, data: lead };
}
//# sourceMappingURL=lead.service.js.map