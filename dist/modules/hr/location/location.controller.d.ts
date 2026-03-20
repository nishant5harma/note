import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../../types/auth-request.js";
export declare const LocationController: {
    createLocationRequestHandler: typeof createLocationRequestHandler;
    getLocationRequestResultHandler: typeof getLocationRequestResultHandler;
    respondLocationRequestHandler: typeof respondLocationRequestHandler;
};
export default LocationController;
/**
 * POST /api/hr/location-requests
 */
declare function createLocationRequestHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | null | undefined>;
/**
 * POST /api/hr/location-requests/:id/respond
 */
declare function respondLocationRequestHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | null | undefined>;
/**
 * GET /api/hr/location-requests/:id/result
 */
declare function getLocationRequestResultHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | null | undefined>;
//# sourceMappingURL=location.controller.d.ts.map