// /src/modules/hr/device/device.routes.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { registerDeviceHandler, unregisterDeviceHandler, listMyDevicesHandler, } from "./device.controller.js";
export const DeviceRouter = Router();
DeviceRouter.post("/register", requirePermission("device", "register"), registerDeviceHandler);
DeviceRouter.post("/unregister", requirePermission("device", "unregister"), unregisterDeviceHandler);
DeviceRouter.get("/", requirePermission("device", "read"), listMyDevicesHandler);
export default DeviceRouter;
//# sourceMappingURL=device.route.js.map