// /src/modules/coldcall/report/validator/report.validator.ts
import { z } from "zod";
// -------------------------------------------------------------
// Common Filters
// -------------------------------------------------------------
export const coldCallStatusEnum = z.enum([
    "pending",
    "in_progress",
    "done",
    "skipped_duplicate",
]);
export const coldCallResponseEnum = z.enum([
    "interested",
    "not_interested",
    "follow_up_required",
]);
// -------------------------------------------------------------
// Batch Summary Validator
// GET /coldcall/report/batches/:id/summary
// -------------------------------------------------------------
export const batchSummaryParamsSchema = z.object({
    id: z.string().min(1),
});
// -------------------------------------------------------------
// Entry List Validator
// GET /coldcall/report/entries
// -------------------------------------------------------------
export const listColdCallEntriesQuerySchema = z.object({
    batchId: z.string().optional(),
    status: coldCallStatusEnum.optional(),
    teamId: z.string().optional(),
    userId: z.string().optional(),
    response: coldCallResponseEnum.optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(500).default(50),
});
// -------------------------------------------------------------
// Team Report Validator
// GET /coldcall/report/teams
// -------------------------------------------------------------
export const teamReportQuerySchema = z.object({
    batchId: z.string().optional(),
});
// -------------------------------------------------------------
// Agent Report Validator
// GET /coldcall/report/agents
// -------------------------------------------------------------
export const agentReportQuerySchema = z.object({
    teamId: z.string().optional(),
});
//# sourceMappingURL=report.validator.js.map