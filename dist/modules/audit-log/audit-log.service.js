import { prisma } from "../../db/db.js";
export async function listAuditLogs(params) {
    const where = {};
    if (params.userId)
        where.userId = params.userId;
    if (params.roleName)
        where.roleName = params.roleName;
    if (params.action)
        where.action = params.action;
    if (params.resource)
        where.resource = params.resource;
    if (params.resourceId)
        where.resourceId = params.resourceId;
    if (params.actionPrefix) {
        where.action = { ...(where.action ?? {}), startsWith: params.actionPrefix };
    }
    if (params.from || params.to) {
        where.createdAt = {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
        };
    }
    if (params.q) {
        const q = params.q.trim();
        where.OR = [
            { action: { contains: q, mode: "insensitive" } },
            { resource: { contains: q, mode: "insensitive" } },
            { resourceId: { contains: q, mode: "insensitive" } },
        ];
    }
    const skip = (params.page - 1) * params.limit;
    const [total, rows] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: params.limit,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        }),
    ]);
    return {
        total,
        page: params.page,
        limit: params.limit,
        data: rows,
    };
}
export async function getAuditLogById(id) {
    return prisma.auditLog.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
}
//# sourceMappingURL=audit-log.service.js.map