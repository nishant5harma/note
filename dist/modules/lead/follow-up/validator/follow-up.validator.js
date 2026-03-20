// /src/modules/lead/follow-up/validator/follow-up.validator.ts
import { z } from "zod";
import { LeadPriority, LeadStage, LeadStatus } from "@prisma/client";
export const createFollowUpSchema = z.object({
    assignedTo: z.string().nullable().optional(),
    dueAt: z.date().nullable().optional(),
    note: z.string().max(2000).nullable().optional(),
    disposition: z.string().max(500).nullable().optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
    status: z.enum(["pending", "done", "skipped"]).optional(),
});
export const updateStatusSchema = z.object({
    status: z.enum(LeadStatus),
    stage: z.enum(LeadStage).optional(),
    priority: z.enum(LeadPriority).optional(),
    disposition: z.string().max(500).nullable().optional(),
    note: z.string().max(2000).nullable().optional(),
    rating: z.number().int().min(0).max(5).nullable().optional(),
});
//# sourceMappingURL=follow-up.validator.js.map