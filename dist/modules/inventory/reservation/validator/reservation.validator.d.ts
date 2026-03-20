import { z } from "zod";
/**
 * Reservation create DTO
 * - exactly one of unitId | listingId must be provided (refinement)
 * - expiresAt is optional ISO string (will be parsed by service)
 */
export declare const createReservationSchema: z.ZodObject<{
    leadId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    listingId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    userId: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
/**
 * Reservation update / partial DTO (keeps previous shape)
 */
export declare const updateReservationSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        CONFIRMED: "CONFIRMED";
        EXPIRED: "EXPIRED";
        ACTIVE: "ACTIVE";
        CANCELLED: "CANCELLED";
    }>>;
    confirmedAt: z.ZodOptional<z.ZodString>;
    cancelledAt: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=reservation.validator.d.ts.map