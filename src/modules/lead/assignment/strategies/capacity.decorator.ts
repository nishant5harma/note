// src/modules/lead/assignment/strategies/capacity.decorator.ts
import { getRedisClient } from "@/db/redis.js";
import { prisma } from "@/db/db.js";

// simple decorator that asks baseStrategy for candidate and validates capacity
export class CapacityDecorator {
  base: any;
  redis = getRedisClient();

  constructor(baseStrategy: any) {
    this.base = baseStrategy;
  }

  async pickCandidate(ctx: { lead: any; assignment: any }) {
    // Ask base strategy for a candidate (may be user or team)
    const candidate = await this.base.pickCandidate(ctx);
    if (!candidate) return null;

    if (candidate.type === "user") {
      const userId = candidate.userId!;
      // Check user's configured max capacity
      const capRow = await prisma.userCapacity.findUnique({
        where: { userId },
      });
      const maxOpen =
        capRow?.maxOpen ??
        parseInt(process.env.DEFAULT_USER_MAX_OPEN ?? "10", 10);

      // Count current open leads for user
      const openCount = await prisma.lead.count({
        where: {
          assignedToId: userId,
          status: { notIn: ["WON", "LOST", "UNASSIGNED_ESCALATED"] }, // adjust terminal states as per your schema
        },
      });

      if (openCount >= maxOpen) {
        // user full -> return null so caller can requeue or strategy can try team fallback
        return null;
      }

      // else ok
      return candidate;
    }

    // team candidate -> let caller handle team path
    return candidate;
  }
}
