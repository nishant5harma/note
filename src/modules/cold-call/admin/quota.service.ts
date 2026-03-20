// src/modules/cold-call/admin/quota.service.ts
import { prisma } from "@/db/db.js";
import { startOfDay } from "date-fns";

export async function setTeamQuota(
  teamId: string,
  period: string,
  metric: string,
  target: number
) {
  // Upsert by unique (teamId, period, metric)
  const q = await prisma.coldCallQuota.upsert({
    where: { teamId_period_metric: { teamId, period, metric } as any },
    create: { teamId, period, metric, target },
    update: { target, active: true },
  });
  return q;
}

export async function getTeamQuotas(teamId: string) {
  return prisma.coldCallQuota.findMany({ where: { teamId } });
}

export async function getTeamQuotaProgress(teamId: string, period = "daily") {
  const quota = await prisma.coldCallQuota.findFirst({
    where: { teamId, period, active: true },
  });
  if (!quota) return null;

  // For daily only for now: read today's aggregate
  if (period === "daily") {
    const today = startOfDay(new Date());
    const agg = await prisma.coldCallAggregate.findFirst({
      where: { kind: "team", entityId: teamId, date: today },
    });
    const conversions = agg?.conversions ?? 0;
    const percent = quota.target ? (conversions / quota.target) * 100 : 0;
    return { quota, conversions, percent };
  }

  return { quota };
}
