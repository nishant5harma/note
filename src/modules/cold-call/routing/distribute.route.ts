// /src/modules/cold-call/routing/distribute.route.ts
import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  distributeBatchHandler,
  previewBatchHandler,
} from "./distribute.controller.js";

const DistributionRouter: Router = Router();

DistributionRouter.post(
  "/:id/distribute",
  requirePermission("coldcall", "distribute"),
  distributeBatchHandler
);

DistributionRouter.get(
  "/:id/preview",
  requirePermission("coldcall", "read"),
  previewBatchHandler
);

export default DistributionRouter;
