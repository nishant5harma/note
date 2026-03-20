import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    roleIds: z.ZodArray<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=user.validator.d.ts.map