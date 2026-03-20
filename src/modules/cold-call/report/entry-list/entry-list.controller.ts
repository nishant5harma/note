// /src/modules/cold-call/report/entry-list/entry-list.controller.ts
import type { Request, Response, NextFunction } from "express";
import { listColdCallEntries } from "./entry-list.service.js";
import { listColdCallEntriesQuerySchema } from "../validator/report.validator.js";

export async function listEntriesHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = listColdCallEntriesQuerySchema.parse(req.query);

    const result = await listColdCallEntries(parsed);

    return res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
