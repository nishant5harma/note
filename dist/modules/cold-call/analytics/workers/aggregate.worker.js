// src/modules/cold-call/analytics/workers/aggregate.worker.ts
import { Worker } from "bullmq";
import { getRedisClient } from "../../../../db/redis.js";
import { prisma } from "../../../../db/db.js";
import { startOfDay, endOfDay, subDays } from "date-fns";
/* ------------------------------------------------------------------ */
/* PURE AGGREGATION LOGIC (TESTABLE)                                   */
/* ------------------------------------------------------------------ */
export async function runColdCallAggregation() {
    const day = subDays(new Date(), 1);
    const from = startOfDay(day);
    const to = endOfDay(day);
    // 1) Agent-level aggregates
    const agentRows = await prisma.$queryRaw `
    SELECT a."userId" as "userId",
           COUNT(*) as attempts,
           SUM(CASE WHEN a.result IN ('interested','callback') THEN 1 ELSE 0 END) as connects,
           SUM(CASE WHEN e."leadId" IS NOT NULL THEN 1 ELSE 0 END) as conversions
    FROM "ColdCallAttempt" a
    LEFT JOIN "ColdCallEntry" e ON e.id = a."entryId"
    WHERE a."createdAt" BETWEEN ${from} AND ${to}
    GROUP BY a."userId"
  `;
    for (const r of agentRows) {
        if (!r.userId)
            continue;
        const key = `agent:${r.userId}:${from.toISOString().slice(0, 10)}`;
        await prisma.coldCallAggregate.upsert({
            where: { key },
            create: {
                key,
                kind: "agent",
                entityId: r.userId,
                date: from,
                attempts: Number(r.attempts ?? 0),
                connects: Number(r.connects ?? 0),
                conversions: Number(r.conversions ?? 0),
            },
            update: {
                attempts: Number(r.attempts ?? 0),
                connects: Number(r.connects ?? 0),
                conversions: Number(r.conversions ?? 0),
            },
        });
    }
    // 2) Team-level aggregates
    const teamRows = await prisma.$queryRaw `
    SELECT e."assignedTeamId" as "teamId",
           COUNT(a.*) as attempts,
           SUM(CASE WHEN a.result IN ('interested','callback') THEN 1 ELSE 0 END) as connects,
           SUM(CASE WHEN e."leadId" IS NOT NULL THEN 1 ELSE 0 END) as conversions
    FROM "ColdCallAttempt" a
    JOIN "ColdCallEntry" e ON e.id = a."entryId"
    WHERE a."createdAt" BETWEEN ${from} AND ${to}
      AND e."assignedTeamId" IS NOT NULL
    GROUP BY e."assignedTeamId"
  `;
    for (const r of teamRows) {
        if (!r.teamId)
            continue;
        const key = `team:${r.teamId}:${from.toISOString().slice(0, 10)}`;
        await prisma.coldCallAggregate.upsert({
            where: { key },
            create: {
                key,
                kind: "team",
                entityId: r.teamId,
                date: from,
                attempts: Number(r.attempts ?? 0),
                connects: Number(r.connects ?? 0),
                conversions: Number(r.conversions ?? 0),
            },
            update: {
                attempts: Number(r.attempts ?? 0),
                connects: Number(r.connects ?? 0),
                conversions: Number(r.conversions ?? 0),
            },
        });
    }
    console.log("[coldcall] daily aggregate completed for", from.toISOString().slice(0, 10));
}
/* ------------------------------------------------------------------ */
/* WORKER REGISTRATION (RUNTIME ONLY)                                  */
/* ------------------------------------------------------------------ */
if (process.env.NODE_ENV !== "test") {
    const connection = getRedisClient();
    const worker = new Worker("coldcall-aggregate", async () => {
        await runColdCallAggregation();
    }, { connection });
    worker.on("failed", (_job, err) => {
        console.error("[coldcall] aggregate.worker failed:", err);
    });
}
//# sourceMappingURL=aggregate.worker.js.map