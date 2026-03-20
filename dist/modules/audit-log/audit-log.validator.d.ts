import { z } from "zod";
export declare const listAuditLogsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>, z.ZodNumber>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodNumber>>, z.ZodNumber>>>;
    userId: z.ZodOptional<z.ZodString>;
    roleName: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    actionPrefix: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    resourceId: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodDate>>>;
    to: z.ZodOptional<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodOptional<z.ZodDate>>>;
    q: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=audit-log.validator.d.ts.map