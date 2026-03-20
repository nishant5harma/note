import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import AuthRouter from "@/modules/auth/auth.routes.js";
import UserRouter from "@/modules/user/user.route.js";
import RbacRouter from "@/modules/rbac/rbac.route.js";
import TeamRouter from "@/modules/team/team.route.js";
import HrRouter from "@/modules/hr/hr.route.js";
import LeadRouter from "@/modules/lead/lead.route.js";
import AuditLogRouter from "@/modules/audit-log/audit-log.route.js";
import InventoryRouter from "../inventory/inventory.route.js";
import ColdCallRouter from "../cold-call/cold-call.routes.js";

// /src/modules/app/app.route.ts

// wrapped in /api in app.ts
export const AppRouter: Router = Router();

AppRouter.use("/auth", AuthRouter);
AppRouter.use("/users", requireAuth, UserRouter);
AppRouter.use("/rbac", requireAuth, RbacRouter);
AppRouter.use("/teams", requireAuth, TeamRouter);
AppRouter.use("/hr", requireAuth, HrRouter);
AppRouter.use("/leads", LeadRouter); // TODO: check for auth
AppRouter.use("/audit-logs", AuditLogRouter);
AppRouter.use("/inventory", requireAuth, InventoryRouter);
AppRouter.use("/coldcall", requireAuth, ColdCallRouter);

// Health check
AppRouter.get("/health", (_req, res) => {
  res.json({ message: "Welcome to the CRM Backend API" });
});

export default AppRouter;
