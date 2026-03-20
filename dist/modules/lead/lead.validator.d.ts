import { z } from "zod";
export declare const listLeadsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>, z.ZodNumber>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>, z.ZodNumber>>>;
    q: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    stage: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    assignedToId: z.ZodOptional<z.ZodString>;
    assignedTeamId: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=lead.validator.d.ts.map