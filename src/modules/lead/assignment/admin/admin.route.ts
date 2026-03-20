// src/modules/lead/assignment/admin.routes.ts
import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  listEscalatedHandler,
  assignEscalatedHandler,
} from "./admin.controller.js";

export const AdminRouter: Router = Router();

// list escalated leads
AdminRouter.get(
  "/escalated",
  requirePermission("lead", "escalation"),
  listEscalatedHandler
);

// assign an escalated lead to a user
AdminRouter.post(
  "/escalated/:id/assign",
  requirePermission("lead", "assign"),
  assignEscalatedHandler
);

export default AdminRouter;
