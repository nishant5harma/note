import { z } from "zod";
export declare const setQuotaSchema: z.ZodObject<{
    teamId: z.ZodString;
    period: z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
        monthly: "monthly";
    }>;
    metric: z.ZodEnum<{
        attempts: "attempts";
        connects: "connects";
        conversions: "conversions";
    }>;
    target: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=validator.analytics.d.ts.map