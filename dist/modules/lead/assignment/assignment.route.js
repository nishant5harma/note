// /src/modules/lead/assignment/assignment.route.ts
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { Router } from "express";
import { manualAssignHandler } from "./assignment.controller.js";
import AdminRouter from "./admin/admin.route.js";
export const AssignmentRouter = Router();
AssignmentRouter.post("/:id", requirePermission("lead", "assign"), manualAssignHandler);
AssignmentRouter.use("/admin", AdminRouter);
export default AssignmentRouter;
//# sourceMappingURL=assignment.route.js.map