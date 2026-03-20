import { z } from "zod";
export declare const coldCallStatusEnum: z.ZodEnum<{
    pending: "pending";
    done: "done";
    in_progress: "in_progress";
    skipped_duplicate: "skipped_duplicate";
}>;
export declare const coldCallResponseEnum: z.ZodEnum<{
    interested: "interested";
    not_interested: "not_interested";
    follow_up_required: "follow_up_required";
}>;
export declare const batchSummaryParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type BatchSummaryParams = z.infer<typeof batchSummaryParamsSchema>;
export declare const listColdCallEntriesQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        done: "done";
        in_progress: "in_progress";
        skipped_duplicate: "skipped_duplicate";
    }>>;
    teamId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    response: z.ZodOptional<z.ZodEnum<{
        interested: "interested";
        not_interested: "not_interested";
        follow_up_required: "follow_up_required";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type ListColdCallEntriesQuery = z.infer<typeof listColdCallEntriesQuerySchema>;
export declare const teamReportQuerySchema: z.ZodObject<{
    batchId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TeamReportQuery = z.infer<typeof teamReportQuerySchema>;
export declare const agentReportQuerySchema: z.ZodObject<{
    teamId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AgentReportQuery = z.infer<typeof agentReportQuerySchema>;
//# sourceMappingURL=report.validator.d.ts.map