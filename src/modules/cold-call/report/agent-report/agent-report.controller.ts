// /src/modules/cold-call/report/agent-report/agent-report.controller.ts
import { agentReportQuerySchema } from "../validator/report.validator.js";
import { getAgentReport } from "./agent-report.service.js";
import type { Request, Response, NextFunction } from "express";

export async function agentReportHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = agentReportQuerySchema.parse(req.query);
    const result = await getAgentReport(query.teamId);
    return res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
