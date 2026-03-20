// src/modules/hr/attendance/validator/attendance.validator.ts
import { z } from "zod";
export const attendanceCheckinSchema = z.object({
    photoRef: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    accuracy: z.number().optional(),
    locationTs: z.string().optional(), // ISO string
    note: z.string().optional(),
});
export const attendanceListSchema = z.object({
    userId: z.string().optional(),
    teamId: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
});
//# sourceMappingURL=attendance.validator.js.map