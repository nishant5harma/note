/**
 * Basic RoundRobinStrategy:
 * - For given team (if provided in lead or pool), fetch active members
 * - Keeps a pointer in Redis and rotates
 *
 * Exposes pickCandidate(ctx) -> { type: 'user', userId } | { type: 'team', teamId } | null
 *
 * Added:
 * - safeIncr(...) to protect pointer overflow
 * - getAndIncrementPointer(poolKey) helper to compute deterministic offsets
 */
export declare class RoundRobinStrategy {
    redis: import("ioredis").default;
    safeIncr(key: string): Promise<number>;
    getAndIncrementPointer(poolId: string): Promise<number>;
    pickCandidate(ctx: {
        lead: any;
        assignment: any;
    }): Promise<{
        type: string;
        teamId: any;
        userId?: undefined;
    } | {
        type: string;
        userId: string;
        teamId?: undefined;
    }>;
}
export default RoundRobinStrategy;
//# sourceMappingURL=round-robin.d.ts.map