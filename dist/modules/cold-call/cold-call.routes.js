// /src/modules/cold-call/cold-call.routes.ts
import { Router } from "express";
import DistributeRouter from "./routing/distribute.route.js";
import ColdCallFileUploadRouter from "./upload/upload.route.js";
import PullRouter from "./agent/pull.route.js";
import ReportRouter from "./report/report.route.js";
import AnalyticsRouter from "./analytics/analytics.route.js";
import QuotaRouter from "./admin/quota.route.js";
const ColdCallRouter = Router();
ColdCallRouter.use("/upload", ColdCallFileUploadRouter);
ColdCallRouter.use("/batches", DistributeRouter);
ColdCallRouter.use("/pull", PullRouter);
ColdCallRouter.use("/report", ReportRouter);
ColdCallRouter.use("/analytics", AnalyticsRouter);
ColdCallRouter.use("/quota", QuotaRouter);
export default ColdCallRouter;
//# sourceMappingURL=cold-call.routes.js.map