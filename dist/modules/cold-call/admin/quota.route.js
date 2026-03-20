// src/modules/cold-call/admin/quota.route.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { setQuotaHandler, listQuotasHandler, quotaProgressHandler, } from "./quota.controller.js";
const QuotaRouter = Router();
// Set quota
QuotaRouter.post("/", requirePermission("coldcall", "admin"), setQuotaHandler);
// List quotas for team
QuotaRouter.get("/:teamId", requirePermission("coldcall", "read"), listQuotasHandler);
// Progress check
QuotaRouter.get("/:teamId/progress", requirePermission("coldcall", "read"), quotaProgressHandler);
export default QuotaRouter;
//# sourceMappingURL=quota.route.js.map