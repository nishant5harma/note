/**
 * Resolve a SourcePool by source key.
 * Returns { teamId, strategy, meta } or null
 */
export declare function resolveSourcePool(source?: string): Promise<{
    teamId: string;
    strategy: string;
    meta: import("@prisma/client/runtime/library").JsonValue;
}>;
/**
 * Convenience: find a teamId for a lead (try SourcePool, else lead.assignedTeamId)
 */
export declare function findTeamForLead(lead: any): Promise<any>;
//# sourceMappingURL=source-pool.service.d.ts.map