import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    roleIds: z.ZodArray<z.ZodUUID>;
    teamId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strip>;
//# sourceMappingURL=user.validator.d.ts.map