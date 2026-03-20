import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types/auth-request.js";
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map