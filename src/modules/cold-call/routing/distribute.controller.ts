// /src/modules/cold-call/routing/distribute.controller.ts

import type { Request, Response, NextFunction } from "express";
import { distributeColdCallBatchService } from "./distribute.service.js";

export async function distributeBatchHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const batchId = req.params.id as string;

    const dryRun = req.query.dryRun === "true" || req.query.dryRun === "1";
    const force = req.query.force === "true" || req.query.force === "1";

    const result = await distributeColdCallBatchService(batchId, {
      dryRun,
      force,
    });

    return res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function previewBatchHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const batchId = req.params.id as string;
    const limit = Number(req.query.limit ?? 50);
    const offset = Number(req.query.offset ?? 0);

    const result = await distributeColdCallBatchService(batchId, {
      dryRun: true,
      previewLimit: limit,
      previewOffset: offset,
    });

    return res.json({
      ok: true,
      preview: {
        limit,
        offset,
        totalPreviewed: result.preview.length,
        rows: result.preview,
        distribution: result.teamDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
}
