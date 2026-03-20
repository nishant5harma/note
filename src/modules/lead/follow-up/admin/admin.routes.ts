// /src/modules/lead/follow-up/admin/admin.route.ts
import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";

import {
  adminListFollowUpsHandler,
  adminStageFunnelHandler,
  adminRatingsHandler,
} from "./admin.controller.js";

export const FollowUpAdminRouter: Router = Router();

/**
 * Admin: List follow-ups with filters
 * Permissions: lead.read or lead.escalation (your call — using lead.read for now)
 */
FollowUpAdminRouter.get(
  "/",
  requirePermission("lead", "read"),
  adminListFollowUpsHandler
);

/**
 * Admin: Stage funnel analytics
 */
FollowUpAdminRouter.get(
  "/funnel",
  requirePermission("lead", "read"),
  adminStageFunnelHandler
);

/**
 * Admin: Ratings aggregation
 */
FollowUpAdminRouter.get(
  "/ratings",
  requirePermission("lead", "read"),
  adminRatingsHandler
);

export default FollowUpAdminRouter;
