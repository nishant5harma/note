// /src/modules/inventory/project/project.route.ts

import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  createProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from "./project.controller.js";

export const ProjectRouter: Router = Router();

ProjectRouter.get(
  "/",
  requirePermission("inventory", "read"),
  listProjectsHandler
);

ProjectRouter.post(
  "/",
  requirePermission("inventory", "write"),
  createProjectHandler
);

ProjectRouter.put(
  "/:id",
  requirePermission("inventory", "write"),
  updateProjectHandler
);

ProjectRouter.delete(
  "/:id",
  requirePermission("inventory", "delete"),
  deleteProjectHandler
);

export default ProjectRouter;
