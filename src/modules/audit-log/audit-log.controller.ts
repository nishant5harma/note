import type { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "@/utils/http-errors.util.js";
import { toStringSafe } from "@/utils/fix.js";
import { listAuditLogsQuerySchema } from "./audit-log.validator.js";
import { getAuditLogById, listAuditLogs } from "./audit-log.service.js";

export async function listAuditLogsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = listAuditLogsQuerySchema.parse(req.query as any);
    const r = await listAuditLogs(q);
    return res.json({ ok: true, ...r });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = toStringSafe(req.params.id);
    if (!id) throw new BadRequestError("id is required");
    const row = await getAuditLogById(id);
    if (!row) throw new NotFoundError("AuditLog not found");
    return res.json({ ok: true, data: row });
  } catch (err) {
    next(err);
  }
}

