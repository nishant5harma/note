import { z } from "zod";
import type { agentReportQuerySchema, batchSummaryParamsSchema, listColdCallEntriesQuerySchema, teamReportQuerySchema } from "../validator/report.validator.js";
export type BatchSummaryParams = z.infer<typeof batchSummaryParamsSchema>;
export type ListColdCallEntriesQuery = z.infer<typeof listColdCallEntriesQuerySchema>;
export type TeamReportQuery = z.infer<typeof teamReportQuerySchema>;
export type AgentReportQuery = z.infer<typeof agentReportQuerySchema>;
//# sourceMappingURL=report.type.d.ts.map