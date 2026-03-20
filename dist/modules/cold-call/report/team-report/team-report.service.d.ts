export declare function getColdCallTeamReport(batchId?: string): Promise<{
    attempts: number;
    interested: number;
    successRate: string;
    pending: number;
    in_progress: number;
    done: number;
    skipped_duplicate: number;
    teamId: string;
    totals: number;
}[]>;
//# sourceMappingURL=team-report.service.d.ts.map