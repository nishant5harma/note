// src/modules/hr/hr.routes.ts
import { Router } from "express";
import AttendanceRouter from "./attendance/attendance.route.js";
import LocationRouter from "./location/location.route.js";
import DeviceRouter from "./device/device.route.js";
import ConsentRouter from "./consent/consent.route.js";
export const HrRouter = Router();
HrRouter.use("/attendance", AttendanceRouter);
HrRouter.use("/location-requests", LocationRouter);
// add near other imports
// then mount
HrRouter.use("/devices", DeviceRouter);
HrRouter.use("/consent", ConsentRouter);
export default HrRouter;
//# sourceMappingURL=hr.route.js.map