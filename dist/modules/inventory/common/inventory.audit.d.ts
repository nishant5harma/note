export declare function inventoryAudit(actorId: string | null, action: string, resource: string, resourceId: string, meta?: any): Promise<{
    id: string;
    createdAt: Date;
    action: string;
    resource: string;
    resourceId: string | null;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    actorId: string | null;
}>;
//# sourceMappingURL=inventory.audit.d.ts.map