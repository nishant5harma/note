import type { Request, Response, NextFunction } from "express";
export declare function createTowerHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getTowerHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function listTowersHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateTowerHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteTowerHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=tower.controller.d.ts.map