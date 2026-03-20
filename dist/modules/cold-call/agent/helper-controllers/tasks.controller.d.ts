import type { Request, Response, NextFunction } from "express";
/**
 * GET /coldcall/my-tasks
 * Returns:
 *  - locked: tasks locked by the user (in_progress)
 *  - pendingCount: number of pending items in user's teams
 *  - recentCompleted: recent tasks (done) by user
 */
export declare function myTasksHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=tasks.controller.d.ts.map