// /src/modules/inventory/common/inventory.audit.ts
import { prisma } from "../../../db/db.js";
export async function inventoryAudit(actorId, action, resource, resourceId, meta) {
    return prisma.inventoryAudit.create({
        data: {
            actorId,
            action,
            resource,
            resourceId,
            meta: meta ?? {},
        },
    });
}
//# sourceMappingURL=inventory.audit.js.map