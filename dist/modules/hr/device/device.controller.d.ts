import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../../types/auth-request.js";
/**
 * POST /api/devices/register
 */
export declare function registerDeviceHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /api/devices/unregister
 */
export declare function unregisterDeviceHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /api/devices (list own devices)
 */
export declare function listMyDevicesHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=device.controller.d.ts.map