// /src/modules/cold-call/report/batch-summary/batch-summary.service.ts
import { prisma } from "@/db/db.js";

export async function getColdCallBatchSummary(batchId: string) {
  const batch = await prisma.coldCallBatch.findUnique({
    where: { id: batchId },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!batch) throw new Error("batch-not-found");

  const totals = await prisma.coldCallEntry.groupBy({
    by: ["status"],
    where: { batchId },
    _count: { _all: true },
  });

  const statusCounts: Record<string, number> = {
    pending: 0,
    in_progress: 0,
    done: 0,
    skipped_duplicate: 0,
  };

  for (const t of totals) {
    statusCounts[t.status] = t._count._all;
  }

  // Team distribution
  const teamDist = await prisma.coldCallEntry.groupBy({
    by: ["assignedTeamId"],
    where: { batchId },
    _count: { _all: true },
  });

  const teamDistribution = teamDist
    .filter((x) => x.assignedTeamId)
    .map((x) => ({
      teamId: x.assignedTeamId!,
      count: x._count._all,
    }));

  // Count of entries which created leads
  const convertedCount = await prisma.coldCallEntry.count({
    where: { batchId, leadId: { not: null } },
  });

  return {
    batch,
    statusCounts,
    teamDistribution,
    convertedCount,
    progress: {
      total: batch.totalCount,
      completed: statusCounts.done,
      pending: statusCounts.pending,
      in_progress: statusCounts.in_progress,
      duplicate: statusCounts.skipped_duplicate,
    },
  };
}
