import { Prisma } from "@prisma/client";
/**
 * Input DTO
 */
export declare function uploadColdCallService(input: {
    fileBuffer: Buffer;
    originalName?: string | null;
    uploadedById: string;
    dedupePolicy: "keep" | "skip";
    mode: "manual" | "decorator";
    teamIds?: string[] | null;
    routingConfig?: any | null;
}): Promise<{
    batchId: string;
    total: number;
    created: number;
    duplicates: number;
    skipped: number;
    preview: {
        id: string;
        createdAt: Date;
        name: string | null;
        email: string | null;
        phone: string | null;
        updatedAt: Date;
        payload: Prisma.JsonValue | null;
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
    }[];
}>;
//# sourceMappingURL=upload.service.d.ts.map