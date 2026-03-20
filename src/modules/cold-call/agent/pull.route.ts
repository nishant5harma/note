// /src/modules/cold-call/agent/pull.route.ts
import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  pullNextHandler,
  refreshLockHandler,
  releaseLockHandler,
} from "./pull.controller.js";
import {
  logAttemptHandler,
  completeEntryHandler,
} from "./helper-controllers/attempt.controller.js";
import { reassignHandler } from "./helper-controllers/reassign.controller.js";
import { myTasksHandler } from "./helper-controllers/tasks.controller.js";

const PullRouter: Router = Router();

// Pull next
PullRouter.post("/", requirePermission("coldcall", "call"), pullNextHandler);

// Lock helpers
PullRouter.post(
  "/entries/:id/refresh-lock",
  requirePermission("coldcall", "call"),
  refreshLockHandler
);
PullRouter.post(
  "/entries/:id/release",
  requirePermission("coldcall", "call"),
  releaseLockHandler
);

// Attempts
PullRouter.post(
  "/entries/:id/attempt",
  requirePermission("coldcall", "call"),
  logAttemptHandler
);

// Complete
PullRouter.post(
  "/entries/:id/complete",
  requirePermission("coldcall", "call"),
  completeEntryHandler
);

// Reassign (admin / team lead)
PullRouter.post(
  "/entries/:id/reassign",
  requirePermission("coldcall", "assign"),
  reassignHandler
);

// Agent feed
PullRouter.get(
  "/my-tasks",
  requirePermission("coldcall", "call"),
  myTasksHandler
);

export default PullRouter;
