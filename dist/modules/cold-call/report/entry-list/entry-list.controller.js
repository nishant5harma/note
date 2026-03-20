import { listColdCallEntries } from "./entry-list.service.js";
import { listColdCallEntriesQuerySchema } from "../validator/report.validator.js";
export async function listEntriesHandler(req, res, next) {
    try {
        const parsed = listColdCallEntriesQuerySchema.parse(req.query);
        const result = await listColdCallEntries(parsed);
        return res.json({ ok: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=entry-list.controller.js.map