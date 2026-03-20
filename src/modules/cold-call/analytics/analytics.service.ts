// src/modules/cold-call/analytics/analytics.service.ts
import { prisma } from "@/db/db.js";
import { startOfDay } from "date-fns";

/**
 * getAgentPerformance(userId, from?)
 * Reads pre-computed ColdCallAggregate rows for the agent.
 */
export async function getAgentPerformance(userId: string, from?: Date) {
  const fromDate = from ?? startOfDay(new Date(Date.now() - 7 * 86400 * 1000));
  const rows = await prisma.coldCallAggregate.findMany({
    where: {
      kind: "agent",
      entityId: userId,
      date: { gte: fromDate },
    },
    orderBy: { date: "desc" },
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.attempts += r.attempts;
      acc.connects += r.connects;
      acc.conversions += r.conversions;
      return acc;
    },
    { attempts: 0, connects: 0, conversions: 0 }
  );

  const conversionRate = totals.attempts
    ? totals.conversions / totals.attempts
    : 0;

  return { totals, conversionRate, rows };
}

/**
 * getTeamPerformance(teamId, from?)
 */
export async function getTeamPerformance(teamId: string, from?: Date) {
  const fromDate = from ?? startOfDay(new Date(Date.now() - 7 * 86400 * 1000));
  const rows = await prisma.coldCallAggregate.findMany({
    where: { kind: "team", entityId: teamId, date: { gte: fromDate } },
    orderBy: { date: "desc" },
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.attempts += r.attempts;
      acc.connects += r.connects;
      acc.conversions += r.conversions;
      return acc;
    },
    { attempts: 0, connects: 0, conversions: 0 }
  );

  return { totals, rows };
}

/**
 * getLeaderboard
 */
export async function getLeaderboard(
  topN = 10,
  metric: "conversions" | "connects" | "attempts" = "conversions",
  sinceDays = 7
) {
  const since = startOfDay(new Date(Date.now() - sinceDays * 86400 * 1000));

  // Aggregate from ColdCallAggregate
  const rows: Array<{ userId: string; value: string }> =
    await prisma.$queryRawUnsafe(
      `
    SELECT "entityId" as "userId", SUM("${metric}") as value
    FROM "ColdCallAggregate"
    WHERE kind = 'agent' AND date >= $1
    GROUP BY "entityId"
    ORDER BY value DESC
    LIMIT $2
  `,
      since,
      topN
    );

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => ({
    userId: r.userId,
    value: Number((r as any).value ?? 0),
    user: userMap.get(r.userId) ?? null,
  }));
}
