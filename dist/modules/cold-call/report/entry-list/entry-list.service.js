// /src/modules/cold-call/report/entry-list/entry-list.service.ts
import { prisma } from "../../../../db/db.js";
export async function listColdCallEntries(params) {
    const { batchId, status, teamId, userId, response, page, limit } = params;
    const where = {};
    if (batchId)
        where.batchId = batchId;
    if (status)
        where.status = status;
    if (teamId)
        where.assignedTeamId = teamId;
    if (userId)
        where.lockUserId = userId;
    if (response)
        where.response = response;
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
        prisma.coldCallEntry.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
                lockUser: { select: { id: true, name: true } },
                assignedTeam: { select: { id: true, name: true } },
            },
        }),
        prisma.coldCallEntry.count({ where }),
    ]);
    return {
        rows,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}
//# sourceMappingURL=entry-list.service.js.map