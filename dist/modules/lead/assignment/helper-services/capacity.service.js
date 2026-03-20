// src/modules/lead/assignment/helper-services/capacity.service.ts
import { prisma } from "../../../../db/db.js";
/**
 * Ensure a UserCapacity row exists for given userId.
 * If missing, create with default maxOpen from env.
 */
export async function ensureUserCapacityRow(userId) {
    const existing = await prisma.userCapacity.findUnique({ where: { userId } });
    if (existing)
        return existing;
    // Use coalesce operator for slightly cleaner default value
    const maxOpen = parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10);
    // Upsert ensures a row exists (atomic on DB side)
    const row = await prisma.userCapacity.upsert({
        where: { userId },
        update: {},
        create: { userId, maxOpen, used: 0 },
    });
    return row;
}
// ---------------------------------------------------------
/**
 * Try to atomically claim capacity for user.
 * Returns true if claimed, false if user at or above capacity.
 *
 * Implementation uses a conditional update: increment `used` only when used < maxOpen.
 */
export async function claimUserCapacity(userId) {
    // Ensure the row exists
    const row = await ensureUserCapacityRow(userId);
    // Use updateMany with conditional "used < maxOpen".
    const res = await prisma.userCapacity.updateMany({
        where: {
            userId,
            // Prisma supports numeric filters; ensure the used < maxOpen condition
            AND: [{ used: { lt: row.maxOpen } }],
        },
        data: {
            used: { increment: 1 },
        },
    });
    // updateMany returns { count: number } — succeeds if count === 1
    return res.count === 1;
}
// ---------------------------------------------------------
/**
 * Release previously claimed capacity for user (decrement used >= 0)
 * Uses a transaction to ensure atomic read-decrement-write.
 */
export async function releaseUserCapacity(userId) {
    await ensureUserCapacityRow(userId);
    return prisma.$transaction(async (tx) => {
        const row = await tx.userCapacity.findUnique({ where: { userId } });
        if (!row)
            return false;
        // Prevent the used count from going below zero.
        const newUsed = Math.max(0, row.used - 1);
        await tx.userCapacity.update({
            where: { userId },
            data: { used: newUsed },
        });
        return true;
    });
}
//# sourceMappingURL=capacity.service.js.map