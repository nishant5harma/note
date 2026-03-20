import { z } from "zod";
export declare const createFollowUpSchema: z.ZodObject<{
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    disposition: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        done: "done";
        skipped: "skipped";
    }>>;
}, z.core.$strip>;
export declare const updateStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        NEW: "NEW";
        CONTACTED: "CONTACTED";
        QUALIFIED: "QUALIFIED";
        UNQUALIFIED: "UNQUALIFIED";
        WON: "WON";
        LOST: "LOST";
        UNASSIGNED_ESCALATED: "UNASSIGNED_ESCALATED";
        ASSIGNED: "ASSIGNED";
    }>;
    stage: z.ZodOptional<z.ZodEnum<{
        INBOUND: "INBOUND";
        QUALIFICATION: "QUALIFICATION";
        DEMO: "DEMO";
        NEGOTIATION: "NEGOTIATION";
        CLOSED: "CLOSED";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        LOW: "LOW";
        NORMAL: "NORMAL";
        HIGH: "HIGH";
    }>>;
    disposition: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=follow-up.validator.d.ts.map