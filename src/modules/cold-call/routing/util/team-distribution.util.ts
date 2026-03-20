// /src/modules/cold-call/routing/util/team-distribution.util.ts
import { getRedisClient } from "@/db/redis.js";

/**
 * Utility: returns a picker that uses Redis atomic pointer for a given key and a sequence array.
 * sequence: precomputed team sequence (expanded for weights)
 *
 * Example usage:
 * const picker = persistentPicker("coldcall:rr:batch:123", ["A","A","B"])
 * const t = await picker(); // returns next teamId (string)
 */
export function persistentPicker(poolKey: string, sequence: string[]) {
  const redis = getRedisClient();
  return async function pick() {
    const raw = await redis.incr(poolKey);
    const idx = (Number(raw) - 1) % sequence.length;
    return sequence[idx];
  };
}

/**
 * Expand weights map into a sequence
 * weights = { teamA: 2, teamB: 1 }
 */
export function expandSequence(
  teamIds: string[],
  weights: Record<string, number> | undefined
) {
  if (!weights) return teamIds.slice();

  const seq: string[] = [];
  for (const t of teamIds) {
    const w = Math.max(1, Math.floor(weights[t] ?? 1));
    for (let i = 0; i < w; i++) seq.push(t);
  }
  return seq;
}
