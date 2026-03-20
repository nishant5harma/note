import type { Request, Response, NextFunction } from "express";
/**
 * POST /coldcall/entries/:id/reassign
 * Body: { toUserId: string, reason?: string }
 *
 * Permission: requirePermission('coldcall', 'assign') on route
 */
export declare function reassignHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=reassign.controller.d.ts.map