// /src/modules/inventory/reservation/reservation.validator.ts
import { z } from "zod";

/**
 * Reservation create DTO
 * - exactly one of unitId | listingId must be provided (refinement)
 * - expiresAt is optional ISO string (will be parsed by service)
 */
export const createReservationSchema = z
  .object({
    leadId: z.string().nullable().optional(),
    unitId: z.string().nullable().optional(),
    listingId: z.string().nullable().optional(),
    userId: z.string().optional(),
    expiresAt: z.string().optional(), // ISO string; service will parse
    note: z.string().optional(),
    meta: z.any().optional(),
  })
  .refine(
    (data) => {
      const hasUnit = !!data.unitId;
      const hasListing = !!data.listingId;
      // exactly one must be provided
      return hasUnit !== hasListing;
    },
    {
      message: "Exactly one of unitId or listingId must be provided.",
      path: ["unitId", "listingId"],
    }
  );

/**
 * Reservation update / partial DTO (keeps previous shape)
 */
export const updateReservationSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "CONFIRMED", "CANCELLED"]).optional(),
  confirmedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  note: z.string().optional(),
});
