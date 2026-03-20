import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import { getAuditLogByIdHandler, listAuditLogsHandler } from "./audit-log.controller.js";

export const AuditLogRouter: Router = Router();

AuditLogRouter.use(requireAuth, requirePermission("auditlog", "read"));

AuditLogRouter.get("/", listAuditLogsHandler);
AuditLogRouter.get("/:id", getAuditLogByIdHandler);

export default AuditLogRouter;

