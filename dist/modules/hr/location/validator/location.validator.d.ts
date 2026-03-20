import { z } from "zod";
export declare const locationRequestCreateSchema: z.ZodObject<{
    targetUserId: z.ZodString;
    expiresInSeconds: z.ZodOptional<z.ZodNumber>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const locationRequestRespondSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    accuracy: z.ZodOptional<z.ZodNumber>;
    recordedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=location.validator.d.ts.map