/**
 * getAgentPerformance(userId, from?)
 * Reads pre-computed ColdCallAggregate rows for the agent.
 */
export declare function getAgentPerformance(userId: string, from?: Date): Promise<{
    totals: {
        attempts: number;
        connects: number;
        conversions: number;
    };
    conversionRate: number;
    rows: {
        id: string;
        createdAt: Date;
        key: string;
        date: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        attempts: number;
        kind: string;
        entityId: string;
        connects: number;
        conversions: number;
    }[];
}>;
/**
 * getTeamPerformance(teamId, from?)
 */
export declare function getTeamPerformance(teamId: string, from?: Date): Promise<{
    totals: {
        attempts: number;
        connects: number;
        conversions: number;
    };
    rows: {
        id: string;
        createdAt: Date;
        key: string;
        date: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        attempts: number;
        kind: string;
        entityId: string;
        connects: number;
        conversions: number;
    }[];
}>;
/**
 * getLeaderboard
 */
export declare function getLeaderboard(topN?: number, metric?: "conversions" | "connects" | "attempts", sinceDays?: number): Promise<{
    userId: string;
    value: number;
    user: {
        id: string;
        name: string;
    };
}[]>;
//# sourceMappingURL=analytics.service.d.ts.map