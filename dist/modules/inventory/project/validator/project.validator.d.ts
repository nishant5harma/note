import { z } from "zod";
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    developer: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    locality: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    developer: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    locality: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
//# sourceMappingURL=project.validator.d.ts.map