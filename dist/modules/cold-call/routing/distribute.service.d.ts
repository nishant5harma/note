export declare function distributeColdCallBatchService(batchId: string, opts?: {
    dryRun?: boolean;
    force?: boolean;
    previewLimit?: number;
    previewOffset?: number;
}): Promise<{
    ok: boolean;
    dryRun: boolean;
    assignedCount: number;
    teamDistribution: Record<string, number>;
    preview: {
        entryId: string;
        teamId: string;
    }[];
}>;
//# sourceMappingURL=distribute.service.d.ts.map