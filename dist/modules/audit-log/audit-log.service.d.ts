export declare function listAuditLogs(params: {
    page: number;
    limit: number;
    userId?: string;
    roleName?: string;
    action?: string;
    actionPrefix?: string;
    resource?: string;
    resourceId?: string;
    from?: Date;
    to?: Date;
    q?: string;
}): Promise<{
    total: number;
    page: number;
    limit: number;
    data: ({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        roleName: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
    })[];
}>;
export declare function getAuditLogById(id: string): Promise<{
    user: {
        id: string;
        name: string;
        email: string;
    };
} & {
    id: string;
    createdAt: Date;
    userId: string | null;
    roleName: string | null;
    action: string;
    resource: string;
    resourceId: string | null;
    payload: import("@prisma/client/runtime/library").JsonValue | null;
}>;
//# sourceMappingURL=audit-log.service.d.ts.map