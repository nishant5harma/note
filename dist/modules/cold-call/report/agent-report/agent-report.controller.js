// /src/modules/cold-call/report/agent-report/agent-report.controller.ts
import { agentReportQuerySchema } from "../validator/report.validator.js";
import { getAgentReport } from "./agent-report.service.js";
export async function agentReportHandler(req, res, next) {
    try {
        const query = agentReportQuerySchema.parse(req.query);
        const result = await getAgentReport(query.teamId);
        return res.json({ ok: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=agent-report.controller.js.map