// /src/modules/cold-call/routing/distribute.controller.ts
import { distributeColdCallBatchService } from "./distribute.service.js";
export async function distributeBatchHandler(req, res, next) {
    try {
        const batchId = req.params.id;
        const dryRun = req.query.dryRun === "true" || req.query.dryRun === "1";
        const force = req.query.force === "true" || req.query.force === "1";
        const result = await distributeColdCallBatchService(batchId, {
            dryRun,
            force,
        });
        return res.json({ ok: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
export async function previewBatchHandler(req, res, next) {
    try {
        const batchId = req.params.id;
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
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=distribute.controller.js.map