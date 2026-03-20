// src/modules/lead/assignment/strategies/round-robin.ts
import { getRedisClient } from "@/db/redis.js";
import { prisma } from "@/db/db.js";

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

export class RoundRobinStrategy {
  redis = getRedisClient();

  // Protect pointer overflow: if pointer grows too large, reset to zero.
  // Returns the incremented value (1-based).
  async safeIncr(key: string): Promise<number> {
    const val = await this.redis.incr(key);
    // safety threshold - tune as you like
    const THRESHOLD = 1_000_000_000;
    if (val > THRESHOLD) {
      await this.redis.set(key, "0");
      return 0;
    }
    return val;
  }

  // Returns 0-based start index (converted from 1-based incr result)
  async getAndIncrementPointer(poolId: string): Promise<number> {
    const key = `lead:rr:team:${poolId}`;
    const raw = await this.safeIncr(key); // raw is 1-based
    // convert to 0-based index for offset arithmetic
    return Math.max(0, raw - 1);
  }

  async pickCandidate(ctx: { lead: any; assignment: any }) {
    const lead = ctx.lead;
    const teamId = lead.assignedTeamId ?? null;

    if (teamId) {
      // select members ordered deterministically (joinedAt asc)
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      });
      if (!members || members.length === 0) return { type: "team", teamId };

      // get pointer and compute selected index
      const startIdx = await this.getAndIncrementPointer(teamId);
      const idx = startIdx % members.length;
      const selected = members[idx];
      if (!selected) return null;
      return { type: "user", userId: selected.userId };
    }

    // fallback: global pool -> pick from all active users who are team members
    const members = await prisma.teamMember.findMany({
      take: 50,
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
    if (!members || members.length === 0) return null;
    const key = `lead:rr:global`;
    const raw = await this.safeIncr(key);
    const idx = (raw - 1) % members.length;
    const selected = members[idx];
    if (!selected) return null;
    return { type: "user", userId: selected.userId };
  }
}

export default RoundRobinStrategy;
