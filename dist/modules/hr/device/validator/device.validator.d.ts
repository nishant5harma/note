import { z } from "zod";
export declare const deviceRegisterSchema: z.ZodObject<{
    deviceId: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodEnum<{
        web: "web";
        ios: "ios";
        android: "android";
    }>>;
    pushToken: z.ZodOptional<z.ZodString>;
    meta: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const deviceUnregisterSchema: z.ZodObject<{
    deviceId: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=device.validator.d.ts.map