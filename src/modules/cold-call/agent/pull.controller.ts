// /src/modules/cold-call/agent/pull.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  claimNextColdCallEntry,
  refreshLock,
  releaseLock,
} from "./pull.service.js";
import { prisma } from "@/db/db.js";

/**
 * POST /coldcall/pull
 * Body (optional): { preferredTeamIds?: string[] }
 *
 * Behavior:
 * - Determine user's teams if preferredTeamIds not provided
 * - Claim next entry using claimNextColdCallEntry
 */
export async function pullNextHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    let teamIds: string[] = [];

    // prefer explicit teamIds param (array or CSV)
    if (req.body?.preferredTeamIds) {
      teamIds = Array.isArray(req.body.preferredTeamIds)
        ? req.body.preferredTeamIds
        : String(req.body.preferredTeamIds)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    } else {
      // fetch user's team memberships
      const members = await prisma.teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      });
      teamIds = members.map((m) => m.teamId);
    }

    if (!teamIds.length) {
      return res.status(400).json({ ok: false, error: "no-team-membership" });
    }

    const entry = await claimNextColdCallEntry(userId, teamIds);
    if (!entry) return res.json({ ok: true, message: "no-available-entry" });

    // Return entry plus lock metadata (TTL)
    return res.json({
      ok: true,
      entry,
      lockExpiresAt: entry.lockExpiresAt,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /coldcall/entries/:id/refresh-lock
 */
export async function refreshLockHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    const entryId = req.params.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    if (!entryId) return res.status(400).json({ error: "entryId required" });

    const updated = await refreshLock(entryId, userId);
    return res.json({ ok: true, entry: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /coldcall/entries/:id/release
 */
export async function releaseLockHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id;
    const entryId = req.params.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    if (!entryId) return res.status(400).json({ error: "entryId required" });
    const updated = await releaseLock(entryId, userId, true);
    return res.json({ ok: true, entry: updated });
  } catch (err) {
    next(err);
  }
}
