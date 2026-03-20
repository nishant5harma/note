// /src/modules/lead/follow-up/admin/admin.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  listFollowUpsByFilter,
  stageFunnel,
  ratingsAggregation,
} from "../follow-up.service.js";

/**
 * GET /api/admin/leads/followups
 * query: disposition, assignedTo, from, to, page, limit
 */
export async function adminListFollowUpsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filter = {
      disposition: req.query.disposition ? String(req.query.disposition) : null,
      assignedTo: req.query.assignedTo ? String(req.query.assignedTo) : null,
      from: req.query.from ? String(req.query.from) : null,
      to: req.query.to ? String(req.query.to) : null,
      page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 100,
    };
    const r = await listFollowUpsByFilter(filter);
    res.json({ ok: true, ...r });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/leads/stage-funnel
 * optional query: teamId, userId
 */
export async function adminStageFunnelHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const scope: { teamId?: string; userId?: string } = {};

    if (req.query.teamId) scope.teamId = req.query.teamId as string;
    if (req.query.userId) scope.userId = req.query.userId as string;
    const r = await stageFunnel(scope);
    res.json({ ok: true, data: r });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/admin/leads/ratings
 * query: groupBy=stage|assignedTo
 */
export async function adminRatingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const groupBy = (req.query.groupBy as any) ?? "stage";
    const r = await ratingsAggregation({ groupBy });
    res.json({ ok: true, data: r });
  } catch (e) {
    next(e);
  }
}
