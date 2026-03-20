// /src/modules/hr/consent/validator/consent.validator.ts
import { z } from "zod";
export const consentCreateSchema = z.object({
    type: z.enum(["LOCATION", "PHOTO", "TERMS"]),
    version: z.string().optional(),
    meta: z.any().optional(),
});
//# sourceMappingURL=consent.validator.js.map