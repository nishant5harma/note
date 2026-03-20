import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/admin/leads/followups
 * query: disposition, assignedTo, from, to, page, limit
 */
export declare function adminListFollowUpsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin/leads/stage-funnel
 * optional query: teamId, userId
 */
export declare function adminStageFunnelHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/admin/leads/ratings
 * query: groupBy=stage|assignedTo
 */
export declare function adminRatingsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map