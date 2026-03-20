import type { NextFunction, Request, Response } from "express";
import { type AuthRequest } from "../../types/auth-request.js";
export declare function loginHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function refreshHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function logoutHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function meHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map