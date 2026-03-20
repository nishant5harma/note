// /src/modules/cold-call/report/agent-report/agent-report.service.ts
import { prisma } from "@/db/db.js";

export async function getAgentReport(teamId?: string) {
  // Get all users involved through lock or assignments
  const users = await prisma.coldCallEntry.findMany({
    where: teamId ? { assignedTeamId: teamId } : {},
    select: { lockUserId: true },
  });

  const userIds = [
    ...new Set(users.map((u) => u.lockUserId).filter(Boolean)),
  ] as string[];

  const results = [];

  for (const uid of userIds) {
    const doneCount = await prisma.coldCallEntry.count({
      where: { lockUserId: uid, status: "done" },
    });

    const attempts = await prisma.coldCallAttempt.count({
      where: { userId: uid },
    });

    const interested = await prisma.coldCallEntry.count({
      where: { lockUserId: uid, response: "interested" },
    });

    results.push({
      userId: uid,
      done: doneCount,
      attempts,
      interested,
      successRate: doneCount > 0 ? (interested / doneCount).toFixed(2) : "0.00",
      avgAttempts: doneCount > 0 ? (attempts / doneCount).toFixed(2) : "0.0",
    });
  }

  return results;
}
