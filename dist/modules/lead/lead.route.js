import { Router } from "express";
import IntakeRouter from "./intake/intake.route.js";
import AssignmentRouter from "./assignment/assignment.route.js";
import FollowUpRouter from "./follow-up/follow-up.route.js";
const LeadRouter = Router();
// Webhook intake (no auth) - consolidated endpoint
LeadRouter.use("/webhook", IntakeRouter);
LeadRouter.use("/assignment", AssignmentRouter);
LeadRouter.use("/followup", FollowUpRouter);
// CRUD and other lead routes (later, protected)
// Example (to be implemented in followup module):
// LeadRouter.get("/", requirePermission("lead", "read"), listLeadsHandler);
export default LeadRouter;
//# sourceMappingURL=lead.route.js.map