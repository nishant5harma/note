// src/modules/lead/assignment/assignment.controller.ts
import type { Request, Response, NextFunction } from "express";
import { manualAssignLead } from "./assignment.service.js";

export async function manualAssignHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = req.params.id;
    const { userId } = req.body;
    const actorId = (req as any).user?.id ?? "system";

    if (typeof leadId !== "string" || !leadId.trim()) {
      return res.status(400).json({ ok: false, error: "leadId is required" });
    }

    await manualAssignLead(leadId, null, userId as string, actorId);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
