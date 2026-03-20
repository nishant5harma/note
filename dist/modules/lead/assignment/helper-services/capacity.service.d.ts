/**
 * Ensure a UserCapacity row exists for given userId.
 * If missing, create with default maxOpen from env.
 */
export declare function ensureUserCapacityRow(userId: string): Promise<{
    userId: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    maxOpen: number;
    used: number;
}>;
/**
 * Try to atomically claim capacity for user.
 * Returns true if claimed, false if user at or above capacity.
 *
 * Implementation uses a conditional update: increment `used` only when used < maxOpen.
 */
export declare function claimUserCapacity(userId: string): Promise<boolean>;
/**
 * Release previously claimed capacity for user (decrement used >= 0)
 * Uses a transaction to ensure atomic read-decrement-write.
 */
export declare function releaseUserCapacity(userId: string): Promise<boolean>;
//# sourceMappingURL=capacity.service.d.ts.map