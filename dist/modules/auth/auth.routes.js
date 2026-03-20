import { Router } from "express";
import { loginHandler, refreshHandler, meHandler, logoutHandler, } from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
// /src/modules/auth/auth.routes.ts
export const AuthRouter = Router();
AuthRouter.post("/login", loginHandler);
AuthRouter.post("/refresh", requireAuth, refreshHandler);
AuthRouter.get("/me", requireAuth, meHandler);
AuthRouter.post("/logout", requireAuth, logoutHandler);
export default AuthRouter;
//# sourceMappingURL=auth.routes.js.map