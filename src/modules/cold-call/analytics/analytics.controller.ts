// src/modules/cold-call/analytics/analytics.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  getAgentPerformance,
  getTeamPerformance,
  getLeaderboard,
} from "./analytics.service.js";
import { parseISO } from "date-fns";
import { toStringSafe } from "@/utils/fix.js";

export async function agentPerformanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = toStringSafe(req.params.userId);
    if (!userId) throw new Error("userId is required");
    const from = req.query.from ? parseISO(String(req.query.from)) : undefined;
    const r = await getAgentPerformance(userId, from);
    res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}

export async function teamPerformanceHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teamId = toStringSafe(req.params.teamId);
    if (!teamId) throw new Error("teamId is required");
    const from = req.query.from ? parseISO(String(req.query.from)) : undefined;
    const r = await getTeamPerformance(teamId, from);
    res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}

export async function leaderboardHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const metric = (req.query.metric as any) ?? "conversions";
    const days = parseInt(String(req.query.days ?? "7"), 10);
    const topN = parseInt(String(req.query.top ?? "10"), 10);
    const r = await getLeaderboard(topN, metric, days);
    res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}
