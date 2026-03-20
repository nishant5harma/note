import type { Request, Response, NextFunction } from "express";
/**
 * POST /coldcall/pull
 * Body (optional): { preferredTeamIds?: string[] }
 *
 * Behavior:
 * - Determine user's teams if preferredTeamIds not provided
 * - Claim next entry using claimNextColdCallEntry
 */
export declare function pullNextHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * POST /coldcall/entries/:id/refresh-lock
 */
export declare function refreshLockHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * POST /coldcall/entries/:id/release
 */
export declare function releaseLockHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=pull.controller.d.ts.map