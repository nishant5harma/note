import { prisma } from "../db/db.js";
// /src/utils/audit.util.ts
export async function logAudit(params) {
    await prisma.auditLog.create({
        data: {
            userId: params.userId ?? null,
            roleName: params.roleName ?? null,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId ?? null,
            payload: params.payload ?? null,
        },
    });
}
//# sourceMappingURL=audit.util.js.map