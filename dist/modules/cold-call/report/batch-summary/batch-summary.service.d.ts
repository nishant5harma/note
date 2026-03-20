export declare function getColdCallBatchSummary(batchId: string): Promise<{
    batch: {
        uploadedBy: {
            id: string;
            name: string;
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        uploadedById: string | null;
        originalName: string | null;
        mode: import("@prisma/client").$Enums.ColdCallBatchMode;
        routingConfig: import("@prisma/client/runtime/library").JsonValue | null;
        dedupePolicy: import("@prisma/client").$Enums.ColdCallDedupePolicy;
        teamConfig: import("@prisma/client/runtime/library").JsonValue | null;
        totalCount: number;
        createdCount: number;
        duplicateCount: number;
        skippedCount: number;
    };
    statusCounts: Record<string, number>;
    teamDistribution: {
        teamId: string;
        count: number;
    }[];
    convertedCount: number;
    progress: {
        total: number;
        completed: number;
        pending: number;
        in_progress: number;
        duplicate: number;
    };
}>;
//# sourceMappingURL=batch-summary.service.d.ts.map