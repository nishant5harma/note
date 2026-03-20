import { Router } from "express";
import { LocationController } from "./location.controller.js";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { requireAuth } from "../../../middlewares/auth.middleware.js";
// src/modules/hr/location/location.route.ts
export const LocationRouter = Router();
// Location Requests
LocationRouter.post("/", requirePermission("location", "request"), LocationController.createLocationRequestHandler);
// target responds to request (must be authenticated user === target)
LocationRouter.post("/:id/respond", requireAuth, LocationController.respondLocationRequestHandler);
// requester polls ephemeral result (only requester may read)
LocationRouter.get("/:id/result", requirePermission("location", "read"), // keep read permission; controller checks requester
LocationController.getLocationRequestResultHandler);
export default LocationRouter;
//# sourceMappingURL=location.route.js.map