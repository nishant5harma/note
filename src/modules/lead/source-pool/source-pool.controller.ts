import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@/utils/http-errors.util.js";
import type { AuthRequest } from "@/types/auth-request.js";
import { logAudit } from "@/utils/audit.util.js";
import {
  listSourcePools,
  listUnmappedLeadSources,
  upsertSourcePool,
  updateSourcePoolBySource,
  deleteSourcePoolBySource,
} from "./source-pool.service.js";
import {
  listSourcePoolsQuerySchema,
  normalizeSource,
  sourcePoolCreateSchema,
  sourcePoolUpdateSchema,
} from "./source-pool.validator.js";

export async function listSourcePoolsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = listSourcePoolsQuerySchema.parse(req.query as any);
    const rows = await listSourcePools({ active: q.active });
    return res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
}

export async function listUnmappedSourcesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sources = await listUnmappedLeadSources();
    return res.json({ ok: true, data: sources });
  } catch (err) {
    next(err);
  }
}

export async function upsertSourcePoolHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dto = sourcePoolCreateSchema.parse(req.body);
    const row = await upsertSourcePool({ ...dto, source: dto.source! });

    // audit (best-effort)
    try {
      const actorId = (req as AuthRequest).user?.id ?? null;
      await logAudit({
        userId: actorId,
        action: "sourcepool.upsert",
        resource: "sourcepool",
        resourceId: row.id,
        payload: {
          source: row.source,
          teamId: row.teamId,
          strategy: row.strategy,
          active: row.active,
        },
      });
    } catch (_) {}

    return res.json({ ok: true, data: row });
  } catch (err) {
    next(err);
  }
}

export async function updateSourcePoolHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const raw = req.params.source;
    if (!raw) throw new BadRequestError("source is required");
    const source = normalizeSource(raw);
    const patch = sourcePoolUpdateSchema.parse(req.body);
    const row = await updateSourcePoolBySource(source, patch);

    // audit (best-effort)
    try {
      const actorId = (req as AuthRequest).user?.id ?? null;
      await logAudit({
        userId: actorId,
        action: "sourcepool.update",
        resource: "sourcepool",
        resourceId: row.id,
        payload: {
          source: row.source,
          teamId: row.teamId,
          strategy: row.strategy,
          active: row.active,
          patch,
        },
      });
    } catch (_) {}

    return res.json({ ok: true, data: row });
  } catch (err) {
    next(err);
  }
}

export async function deleteSourcePoolHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const raw = req.params.source;
    if (!raw) throw new BadRequestError("source is required");
    const source = normalizeSource(raw);
    const deleted = await deleteSourcePoolBySource(source);

    // audit (best-effort)
    try {
      const actorId = (req as AuthRequest).user?.id ?? null;
      await logAudit({
        userId: actorId,
        action: "sourcepool.delete",
        resource: "sourcepool",
        resourceId: deleted.id,
        payload: { source: deleted.source, teamId: deleted.teamId },
      });
    } catch (_) {}

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

