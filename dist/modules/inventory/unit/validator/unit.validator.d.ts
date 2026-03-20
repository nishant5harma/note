import { z } from "zod";
export declare const createUnitSchema: z.ZodObject<{
    projectId: z.ZodString;
    towerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    floor: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    unitNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sizeSqFt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    bedrooms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    bathrooms: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    facing: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    price: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodBigInt]>>>;
    status: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateUnitSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    towerId: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    floor: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    unitNumber: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sizeSqFt: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    bedrooms: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    bathrooms: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    facing: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    price: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodNumber, z.ZodBigInt]>>>>;
    status: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
//# sourceMappingURL=unit.validator.d.ts.map