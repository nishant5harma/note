import type { Request, Response, NextFunction } from "express";
export declare function createUnitHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUnitHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listUnitsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUnitHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteUnitHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function sellUnitHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=unit.controller.d.ts.map