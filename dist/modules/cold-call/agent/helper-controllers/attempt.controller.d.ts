import type { Request, Response, NextFunction } from "express";
/**
 * POST /coldcall/entries/:id/attempt
 * Body: { result?: string, notes?: string }
 *
 * Logs an attempt; does NOT finalize the entry.
 */
export declare function logAttemptHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * POST /coldcall/entries/:id/complete
 */
export declare function completeEntryHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=attempt.controller.d.ts.map