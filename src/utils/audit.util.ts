import { prisma } from "@/db/db.js";

// /src/utils/audit.util.ts
export async function logAudit(params: {
  userId?: string | null;
  roleName?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  payload?: any;
}) {
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
