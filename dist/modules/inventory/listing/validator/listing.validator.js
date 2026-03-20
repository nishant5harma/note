// /src/modules/inventory/listing/validator/listing.validator.ts
import { z } from "zod";
export const createListingSchema = z.object({
    title: z.string().min(1),
    type: z.enum(["SALE", "RENT", "BOTH"]),
    ownerName: z.string().optional(),
    ownerPhone: z.string().optional(),
    ownerEmail: z.string().optional(),
    projectId: z.string().nullable().optional(),
    unitId: z.string().nullable().optional(),
    city: z.string().optional(),
    locality: z.string().optional(),
    price: z.union([z.number(), z.bigint()]).nullable().optional(),
    bedrooms: z.number().int().nullable().optional(),
    bathrooms: z.number().int().nullable().optional(),
    sqft: z.number().nullable().optional(),
    status: z.string().optional(),
    meta: z.any().optional(),
});
export const updateListingSchema = createListingSchema.partial();
//# sourceMappingURL=listing.validator.js.map