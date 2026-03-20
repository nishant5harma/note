import type { AuthRequest } from "../../../types/auth-request.js";
import type { Response, NextFunction } from "express";
/**
 * POST /api/consent
 */
export declare function createConsentHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/consent/revoke
 */
export declare function revokeConsentHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/consent (list for user)
 */
export declare function listConsentsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=consent.controller.d.ts.map