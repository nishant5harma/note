// /src/modules/lead/follow-up/follow-up.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createFollowUp,
  listFollowUps,
  listLeadStageHistory,
  updateLeadStatus,
} from "./follow-up.service.js";
import {
  createFollowUpSchema,
  updateStatusSchema,
} from "./validator/follow-up.validator.js";
import { BadRequestError } from "@/utils/http-errors.util.js";

export async function createFollowUpHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = req.params.id;
    if (!leadId) throw new BadRequestError();
    const actorId = (req as any).user?.id ?? "system";

    const parsed = createFollowUpSchema.parse(req.body);

    const f = await createFollowUp(
      leadId,
      {
        assignedTo: parsed.assignedTo ?? null,
        dueAt: parsed.dueAt ?? null,
        note: parsed.note ?? null,
        disposition: parsed.disposition ?? null,
        rating: parsed.rating ?? null,
        status: parsed.status ?? "pending",
      },
      actorId
    );

    return res.json({ ok: true, data: f });
  } catch (err) {
    next(err);
  }
}

export async function listFollowUpsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = req.params.id;
    if (!leadId) throw new BadRequestError();
    const page = parseInt(String(req.query.page ?? "1"), 10);
    const limit = parseInt(String(req.query.limit ?? "50"), 10);

    const r = await listFollowUps(leadId, { page, limit });
    return res.json({ ok: true, ...r });
  } catch (err) {
    next(err);
  }
}

export async function updateLeadStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = req.params.id;
    if (!leadId) throw new BadRequestError();
    const actorId = (req as any).user?.id ?? "system";

    const dto = updateStatusSchema.parse(req.body);

    const r = await updateLeadStatus(
      leadId,
      {
        status: dto.status,
        stage: dto.stage ?? null,
        priority: dto.priority ?? null,
        disposition: dto.disposition ?? null,
        note: dto.note ?? null,
        rating: dto.rating ?? null,
      },
      actorId
    );

    return res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}

export async function listLeadStageHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = req.params.id;

    if (!leadId || typeof leadId !== "string") {
      return res.status(400).json({ error: "Invalid leadId" });
    }

    const items = await listLeadStageHistory(leadId);

    res.json({ items });
  } catch (err) {
    next(err);
  }
}
