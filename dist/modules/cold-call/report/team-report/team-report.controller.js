// /src/modules/cold-call/report/team-report/team-report.controller.ts
import { teamReportQuerySchema } from "../validator/report.validator.js";
import { getColdCallTeamReport } from "./team-report.service.js";
export async function teamReportHandler(req, res, next) {
    try {
        const query = teamReportQuerySchema.parse(req.query);
        const result = await getColdCallTeamReport(query.batchId);
        return res.json({ ok: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=team-report.controller.js.map