// /src/modules/cold-call/routing/distribute.service.ts

import { prisma } from "@/db/db.js";
import { buildDecorators, runDecorators } from "./routing-engine.js";

import { extractTeamIds } from "./util/extract-teams.util.js";
import { pickWeightedRR } from "./util/round-robin.util.js";
import { expandSequence } from "./util/team-distribution.util.js";

export async function distributeColdCallBatchService(
  batchId: string,
  opts: {
    dryRun?: boolean;
    force?: boolean;
    previewLimit?: number;
    previewOffset?: number;
  } = {}
) {
  const { dryRun = false, force = false, previewLimit, previewOffset } = opts;

  const batch = await prisma.coldCallBatch.findUnique({
    where: { id: batchId },
  });
  if (!batch) throw new Error("Batch not found");

  const whereClause = force ? { batchId } : { batchId, assignedTeamId: null };

  const entries = await prisma.coldCallEntry.findMany({
    where: whereClause,
    orderBy: { rowIndex: "asc" },
  });

  if (!entries.length)
    return {
      ok: true,
      dryRun,
      assignedCount: 0,
      teamDistribution: {},
      preview: [],
    };

  const teamIds = extractTeamIds(batch);
  if (!teamIds.length)
    return {
      ok: true,
      dryRun,
      assignedCount: 0,
      teamDistribution: {},
      preview: [],
    };

  const decorators = buildDecorators(batch.routingConfig);

  const distribution: Record<string, number> = {};
  const previewRows: Array<{ entryId: string; teamId: string }> = [];

  const weights =
    (batch.teamConfig && (batch.teamConfig as any).weights) ?? undefined;

  const sequence = expandSequence(teamIds, weights);
  if (!sequence.length)
    return {
      ok: true,
      dryRun,
      assignedCount: 0,
      teamDistribution: {},
      preview: [],
    };

  const rrKey = `coldcall:rr:batch:${batch.id}`;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;

    const ctx = {
      entry,
      batch,
      availableTeams: teamIds,
      assignedTeamId: entry.assignedTeamId ?? null,
      previousContinue: false,
      meta: {},
    };

    let teamId = null;

    if (decorators.length > 0) {
      teamId = await runDecorators(ctx, decorators);
    }

    if (!teamId) {
      teamId = await pickWeightedRR(rrKey, sequence);
    }

    if (!teamId) continue;

    distribution[teamId] = (distribution[teamId] ?? 0) + 1;

    const isPreviewRow =
      typeof previewLimit === "number" &&
      typeof previewOffset === "number" &&
      i >= previewOffset &&
      previewRows.length < previewLimit;

    if (isPreviewRow) {
      previewRows.push({ entryId: entry.id, teamId });
    }

    if (!dryRun) {
      await prisma.coldCallEntry.update({
        where: { id: entry.id },
        data: { assignedTeamId: teamId },
      });

      // TODO: Write ColdCallAssignmentHistory
      // TODO: Write audit event
    }
  }

  return {
    ok: true,
    dryRun,
    assignedCount: Object.values(distribution).reduce((a, b) => a + b, 0),
    teamDistribution: distribution,
    preview: previewRows,
  };
}
