// /src/modules/cold-call/upload/upload.routes.ts
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import { Router } from "express";
import { uploadColdCallHandler } from "./upload.controller.js";

const ColdCallFileUploadRouter: Router = Router();

// Upload Excel → creates batch
ColdCallFileUploadRouter.post(
  "/",
  requirePermission("coldcall", "upload"),
  uploadColdCallHandler
);

export default ColdCallFileUploadRouter;
