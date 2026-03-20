import { z } from "zod";
export declare const webhookBaseSchema: z.ZodObject<{
    source: z.ZodOptional<z.ZodString>;
    externalId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
    phone: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
//# sourceMappingURL=intake.validator.d.ts.map