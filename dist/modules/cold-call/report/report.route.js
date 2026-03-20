// /src/modules/cold-call/report/report.route.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { batchSummaryHandler } from "./batch-summary/batch-summary.controller.js";
import { listEntriesHandler } from "./entry-list/entry-list.controller.js";
import { teamReportHandler } from "./team-report/team-report.controller.js";
import { agentReportHandler } from "./agent-report/agent-report.controller.js";
const ReportRouter = Router();
ReportRouter.get("/batches/:id/summary", requirePermission("coldcall", "read"), batchSummaryHandler);
ReportRouter.get("/entries", requirePermission("coldcall", "read"), listEntriesHandler);
ReportRouter.get("/teams", requirePermission("coldcall", "read"), teamReportHandler);
ReportRouter.get("/agents", requirePermission("coldcall", "read"), agentReportHandler);
export default ReportRouter;
//# sourceMappingURL=report.route.js.map