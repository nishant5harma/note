import { z } from "zod";
export declare const createListingSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodEnum<{
        SALE: "SALE";
        RENT: "RENT";
        BOTH: "BOTH";
    }>;
    ownerName: z.ZodOptional<z.ZodString>;
    ownerPhone: z.ZodOptional<z.ZodString>;
    ownerEmail: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    unitId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    locality: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodBigInt]>>>;
    bedrooms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    bathrooms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sqft: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateListingSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        SALE: "SALE";
        RENT: "RENT";
        BOTH: "BOTH";
    }>>;
    ownerName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ownerPhone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    ownerEmail: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    projectId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    unitId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    locality: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodBigInt]>>>>;
    bedrooms: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    bathrooms: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    sqft: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
//# sourceMappingURL=listing.validator.d.ts.map