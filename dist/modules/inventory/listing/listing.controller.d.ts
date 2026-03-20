import type { Request, Response, NextFunction } from "express";
export declare function createListingHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getListingHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listListingsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateListingHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function closeListingHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteListingHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=listing.controller.d.ts.map