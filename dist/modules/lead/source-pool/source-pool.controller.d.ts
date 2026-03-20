import type { Request, Response, NextFunction } from "express";
export declare function listSourcePoolsHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function listUnmappedSourcesHandler(_req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function upsertSourcePoolHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function updateSourcePoolHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function deleteSourcePoolHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=source-pool.controller.d.ts.map