import type { Request, Response, NextFunction } from "express";
/**
 * GET /api/leads/escalated
 * Returns paginated list of escalated leads.
 */
export declare function listEscalatedHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/leads/escalated/:id/assign
 * Body: { userId: string }
 *
 * Assign an escalated lead to a user (admin action).
 */
export declare function assignEscalatedHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map