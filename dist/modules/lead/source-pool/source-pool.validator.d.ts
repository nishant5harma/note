import { z } from "zod";
export declare const normalizeSource: (v: unknown) => string;
export declare const sourceKeySchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const sourcePoolCreateSchema: z.ZodObject<{
    source: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    strategy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    active: z.ZodOptional<z.ZodBoolean>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const sourcePoolUpdateSchema: z.ZodObject<{
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    strategy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    active: z.ZodOptional<z.ZodBoolean>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const listSourcePoolsQuerySchema: z.ZodObject<{
    active: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean, "true" | "false">>;
}, z.core.$strip>;
//# sourceMappingURL=source-pool.validator.d.ts.map