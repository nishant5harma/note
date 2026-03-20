// src/modules/hr/device/validator/device.validator.ts
import { z } from "zod";
export const deviceRegisterSchema = z.object({
    deviceId: z.string().optional(),
    platform: z.enum(["ios", "android", "web"]).optional(),
    pushToken: z.string().optional(),
    meta: z.any().optional(),
});
export const deviceUnregisterSchema = z.object({
    deviceId: z.string().optional(),
    pushToken: z.string().optional(),
});
//# sourceMappingURL=device.validator.js.map