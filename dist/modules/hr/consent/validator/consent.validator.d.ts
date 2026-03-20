import { z } from "zod";
export declare const consentCreateSchema: z.ZodObject<{
    type: z.ZodEnum<{
        LOCATION: "LOCATION";
        PHOTO: "PHOTO";
        TERMS: "TERMS";
    }>;
    version: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
//# sourceMappingURL=consent.validator.d.ts.map