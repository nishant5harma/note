// /src/modules/inventory/common/inventory.audit.ts
import { prisma } from "@/db/db.js";

export async function inventoryAudit(
  actorId: string | null,
  action: string,
  resource: string,
  resourceId: string,
  meta?: any
) {
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
