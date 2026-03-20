import { z } from "zod";
export declare const createTowerSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    floors: z.ZodOptional<z.ZodNumber>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateTowerSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    floors: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    meta: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
//# sourceMappingURL=tower.validator.d.ts.map