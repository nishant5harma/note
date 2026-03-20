// /src/modules/cold-call/routing/util/round-robin.util.ts

import { getRedisClient } from "@/db/redis.js";

export async function pickWeightedRR(rrKey: string, sequence: string[]) {
  if (!sequence.length) return null;

  const redis = getRedisClient();
  const raw = await redis.incr(rrKey);
  const idx = (Number(raw) - 1) % sequence.length;
  return sequence[idx] ?? null;
}
