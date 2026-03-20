import type { Request, Response, NextFunction } from "express";
export declare function createReservationHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getReservationHandler(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
export declare function listReservationsHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateReservationHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function cancelReservationHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=reservation.controller.d.ts.map