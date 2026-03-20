// /src/modules/debug/debug.route.ts
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { pushTestHandler } from "./debug.controller.js";
export const DebugRouter = Router();
DebugRouter.post("/push-test", requireAuth, pushTestHandler);
export default DebugRouter;
//# sourceMappingURL=debug.route.js.map