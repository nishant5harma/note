import { z } from "zod";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const logoutSchema: z.ZodObject<{
    refreshToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=auth.validator.d.ts.map