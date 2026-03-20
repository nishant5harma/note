// /src/modules/cold-call/report/batch-summary/batch-summary.controller.ts
import { batchSummaryParamsSchema } from "../validator/report.validator.js";
import { getColdCallBatchSummary } from "./batch-summary.service.js";
export async function batchSummaryHandler(req, res, next) {
    try {
        const params = batchSummaryParamsSchema.parse(req.params);
        const result = await getColdCallBatchSummary(params.id);
        return res.json({ ok: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=batch-summary.controller.js.map