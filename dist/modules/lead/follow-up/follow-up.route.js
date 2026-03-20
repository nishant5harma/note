// /src/modules/lead/follow-up/follow-up.route.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { createFollowUpHandler, listFollowUpsHandler, listLeadStageHistoryHandler, updateLeadStatusHandler, } from "./follow-up.controller.js";
import FollowUpAdminRouter from "./admin/admin.routes.js";
export const FollowUpRouter = Router();
// create followup (agent)
FollowUpRouter.post("/:id/followups", requirePermission("lead", "write"), createFollowUpHandler);
// list followups
FollowUpRouter.get("/:id/followups", requirePermission("lead", "read"), listFollowUpsHandler);
// update lead status/stage/priority (followup + status change)
FollowUpRouter.patch("/:id/status", requirePermission("lead", "write"), updateLeadStatusHandler);
FollowUpRouter.get("/:id/stage-history", requirePermission("lead", "read"), listLeadStageHistoryHandler);
FollowUpRouter.use("/admin", FollowUpAdminRouter);
export default FollowUpRouter;
//# sourceMappingURL=follow-up.route.js.map