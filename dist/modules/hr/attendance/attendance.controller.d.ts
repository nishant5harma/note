import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../../types/auth-request.js";
export declare const AttendanceController: {
    attendanceCheckinHandler: typeof attendanceCheckinHandler;
    attendanceListHandler: typeof attendanceListHandler;
    attendanceCheckoutHandler: typeof attendanceCheckoutHandler;
};
export default AttendanceController;
/**
 * POST /api/hr/attendance/checkin
 */
declare function attendanceCheckinHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/hr/attendance
 */
declare function attendanceListHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/hr/attendance/checkout
 */
declare function attendanceCheckoutHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=attendance.controller.d.ts.map