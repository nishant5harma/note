// src/modules/cold-call/analytics/analytics.routes.ts
import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  agentPerformanceHandler,
  teamPerformanceHandler,
  leaderboardHandler,
} from "./analytics.controller.js";

const AnalyticsRouter: Router = Router();

// Get agent performance (protected)
AnalyticsRouter.get(
  "/agents/:userId",
  requirePermission("coldcall", "read"),
  agentPerformanceHandler
);

// Get team performance
AnalyticsRouter.get(
  "/teams/:teamId",
  requirePermission("coldcall", "read"),
  teamPerformanceHandler
);

// Leaderboard
AnalyticsRouter.get(
  "/leaderboard",
  requirePermission("coldcall", "read"),
  leaderboardHandler
);

export default AnalyticsRouter;
