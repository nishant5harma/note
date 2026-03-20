import { attendanceCheckinSchema, attendanceListSchema, } from "./validator/attendance.validator.js";
import { AttendanceService } from "./attendance.service.js";
import { BadRequestError } from "../../../utils/http-errors.util.js";
import { z } from "zod";
// src/modules/hr/attendance/attendance.controller.ts
// Exports AttendanceController object
export const AttendanceController = {
    attendanceCheckinHandler,
    attendanceListHandler,
    attendanceCheckoutHandler,
};
export default AttendanceController;
// Controller Function Implementations
/** helper to format & return Zod errors */
function handleZodError(err, res) {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ error: z.treeifyError(err) });
    }
    return null;
}
/**
 * POST /api/hr/attendance/checkin
 */
async function attendanceCheckinHandler(req, res, next) {
    try {
        const data = attendanceCheckinSchema.parse(req.body);
        if (!req.user)
            throw new BadRequestError("user missing in request");
        // controller stays simple: pass Zod-parsed data straight to service
        const attendance = await AttendanceService.createCheckin(req.user, data);
        return res.status(201).json({ attendance });
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
/**
 * GET /api/hr/attendance
 */
async function attendanceListHandler(req, res, next) {
    try {
        const parsed = attendanceListSchema.parse(req.query);
        const result = await AttendanceService.listAttendance(parsed);
        return res.json(result);
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
/**
 * POST /api/hr/attendance/checkout
 */
async function attendanceCheckoutHandler(req, res, next) {
    try {
        if (!req.user)
            throw new BadRequestError("user missing in request");
        const result = await AttendanceService.checkout(req.user);
        return res.json(result);
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
//# sourceMappingURL=attendance.controller.js.map