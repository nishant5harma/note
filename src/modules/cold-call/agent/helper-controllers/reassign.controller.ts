// /src/modules/cold-call/agent/helper-controllers/reassign.controller.ts
import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/db/db.js";

/**
 * POST /coldcall/entries/:id/reassign
 * Body: { toUserId: string, reason?: string }
 *
 * Permission: requirePermission('coldcall', 'assign') on route
 */
export async function reassignHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = (req as any).user?.id ?? "system";
    const entryId = req.params.id;
    const toUserId = String(req.body?.toUserId ?? "").trim();
    const reason = req.body?.reason ?? null;

    if (!toUserId)
      return res.status(400).json({ ok: false, error: "toUserId required" });
    if (!entryId)
      return res.status(400).json({ ok: false, error: "entryId required" });

    const updated = await prisma.$transaction(async (tx) => {
      const entry = await tx.coldCallEntry.findUnique({
        where: { id: entryId },
      });
      if (!entry) throw new Error("entry-not-found");

      const fromUserId = entry.lockUserId ?? null;

      // set assignedTeamId (if toUser is member of specific team we can keep assignedTeamId else clear)
      // We'll just set lockUserId to toUserId and set status back to pending for now
      const newEntry = await tx.coldCallEntry.update({
        where: { id: entryId },
        data: {
          lockUserId: null,
          lockExpiresAt: null,
          status: "pending",
        },
      });

      await tx.coldCallAssignmentHistory.create({
        data: {
          entryId,
          fromUserId,
          toUserId,
          reason,
          actorId,
        },
      });

      return newEntry;
    });

    return res.json({ ok: true, entry: updated });
  } catch (err) {
    next(err);
  }
}
