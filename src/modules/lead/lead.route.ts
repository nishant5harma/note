import { Router } from "express";
import IntakeRouter from "./intake/intake.route.js";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import AssignmentRouter from "./assignment/assignment.route.js";
import FollowUpRouter from "./follow-up/follow-up.route.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { LeadController } from "./lead.controller.js";
import SourcePoolRouter from "./source-pool/source-pool.route.js";

const LeadRouter: Router = Router();

// Webhook intake (no auth) - consolidated endpoint
LeadRouter.use("/webhook", IntakeRouter);
// Everything below requires JWT (req.user) before permission checks
LeadRouter.use("/assignment", requireAuth, AssignmentRouter);
LeadRouter.use("/followup", requireAuth, FollowUpRouter);
LeadRouter.use("/source-pools", requireAuth, SourcePoolRouter);
// Protected lead read endpoints
LeadRouter.get("/", requireAuth, requirePermission("lead", "read"), LeadController.listLeadsHandler);
LeadRouter.get(
  "/:id",
  requireAuth,
  requirePermission("lead", "read"),
  LeadController.getLeadByIdHandler
);

export default LeadRouter;
