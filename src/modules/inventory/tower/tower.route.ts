// /src/modules/inventory/tower/tower.route.ts

import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  createTowerHandler,
  getTowerHandler,
  listTowersHandler,
  updateTowerHandler,
  deleteTowerHandler,
} from "./tower.controller.js";

export const TowerRouter: Router = Router();

TowerRouter.get("/", requirePermission("inventory", "read"), listTowersHandler);

TowerRouter.post(
  "/",
  requirePermission("inventory", "write"),
  createTowerHandler
);

TowerRouter.get(
  "/:id",
  requirePermission("inventory", "read"),
  getTowerHandler
);

TowerRouter.put(
  "/:id",
  requirePermission("inventory", "write"),
  updateTowerHandler
);

TowerRouter.delete(
  "/:id",
  requirePermission("inventory", "delete"),
  deleteTowerHandler
);

export default TowerRouter;
