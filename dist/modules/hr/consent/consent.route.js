// src/modules/hr/consent/consent.routes.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { createConsentHandler, revokeConsentHandler, listConsentsHandler, } from "./consent.controller.js";
export const ConsentRouter = Router();
ConsentRouter.post("/", requirePermission("consent", "write"), createConsentHandler);
ConsentRouter.post("/revoke", requirePermission("consent", "write"), revokeConsentHandler);
ConsentRouter.get("/", requirePermission("consent", "read"), listConsentsHandler);
export default ConsentRouter;
//# sourceMappingURL=consent.route.js.map