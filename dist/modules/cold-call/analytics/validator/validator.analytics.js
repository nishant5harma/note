// src/modules/cold-call/analytics/validator/validator.analytics.ts
import { z } from "zod";
export const setQuotaSchema = z.object({
    teamId: z.string().min(1),
    period: z.enum(["daily", "weekly", "monthly"]),
    metric: z.enum(["attempts", "conversions", "connects"]),
    target: z.number().int().min(0),
});
//# sourceMappingURL=validator.analytics.js.map