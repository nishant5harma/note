// src/modules/lead/assignment/helper-services/source-pool.service.ts
import { prisma } from "@/db/db.js";

/**
 * Resolve a SourcePool by source key.
 * Returns { teamId, strategy, meta } or null
 */
export async function resolveSourcePool(source?: string) {
  if (!source) return null;
  const normalized = String(source).trim().toLowerCase();
  const row = await prisma.sourcePool.findUnique({
    where: { source: normalized },
  });
  if (!row) return null;
  return {
    teamId: row.teamId,
    strategy: row.strategy ?? null,
    meta: row.meta ?? null,
  };
}

/**
 * Convenience: find a teamId for a lead (try SourcePool, else lead.assignedTeamId)
 */
export async function findTeamForLead(lead: any) {
  if (lead.assignedTeamId) return lead.assignedTeamId;
  const pool = await resolveSourcePool(lead.source);
  if (pool) return pool.teamId;
  return null;
}
