import type { ListColdCallEntriesQuery } from "../types/report.type.js";
export declare function listColdCallEntries(params: ListColdCallEntriesQuery): Promise<{
    rows: ({
        assignedTeam: {
            id: string;
            name: string;
        } | null;
        lockUser: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string | null;
        email: string | null;
        phone: string | null;
        updatedAt: Date;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        leadId: string | null;
        status: import("@prisma/client").$Enums.ColdCallEntryStatus;
        priority: number;
        dedupeHash: string | null;
        assignedTeamId: string | null;
        disposition: import("@prisma/client").$Enums.ColdCallDisposition | null;
        batchId: string;
        rowIndex: number | null;
        lockUserId: string | null;
        lockExpiresAt: Date | null;
        response: import("@prisma/client").$Enums.ColdCallResponse | null;
        summary: string | null;
    })[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}>;
//# sourceMappingURL=entry-list.service.d.ts.map