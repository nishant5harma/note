import type { Request, Response, NextFunction } from "express";
export declare function setQuotaHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listQuotasHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function quotaProgressHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=quota.controller.d.ts.map