// /src/modules/cold-call/agent/helper-controllers/tasks.controller.ts
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/db/db.js";

/**
 * GET /coldcall/my-tasks
 * Returns:
 *  - locked: tasks locked by the user (in_progress)
 *  - pendingCount: number of pending items in user's teams
 *  - recentCompleted: recent tasks (done) by user
 */
export async function myTasksHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    // list teams
    const members = await prisma.teamMember.findMany({
      where: { userId },
      select: { teamId: true },
    });
    const teamIds = members.map((m) => m.teamId);

    // locked entries
    const locked = await prisma.coldCallEntry.findMany({
      where: { lockUserId: userId, status: "in_progress" },
      orderBy: { lockExpiresAt: "asc" },
      take: 50,
    });

    // pending count across user's teams
    const pendingCount = await prisma.coldCallEntry.count({
      where: { assignedTeamId: { in: teamIds }, status: "pending" },
    });

    // recent completed items by user
    const recentCompleted = await prisma.coldCallEntry.findMany({
      where: { lockUserId: userId, status: "done" },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return res.json({
      ok: true,
      locked,
      pendingCount,
      recentCompleted,
    });
  } catch (err) {
    next(err);
  }
}
