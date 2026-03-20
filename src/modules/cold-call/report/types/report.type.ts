// /src/modules/coldcall/report/types/report.type.ts
import { z } from "zod";
import type {
  agentReportQuerySchema,
  batchSummaryParamsSchema,
  listColdCallEntriesQuerySchema,
  teamReportQuerySchema,
} from "../validator/report.validator.js";

// -------------------------------------------------------------
// Batch Summary Type
// -------------------------------------------------------------

export type BatchSummaryParams = z.infer<typeof batchSummaryParamsSchema>;

// -------------------------------------------------------------
// Entry List Type
// -------------------------------------------------------------

export type ListColdCallEntriesQuery = z.infer<
  typeof listColdCallEntriesQuerySchema
>;

// -------------------------------------------------------------
// Team Report Type
// -------------------------------------------------------------

export type TeamReportQuery = z.infer<typeof teamReportQuerySchema>;

// -------------------------------------------------------------
// Agent Report Type
// -------------------------------------------------------------

export type AgentReportQuery = z.infer<typeof agentReportQuerySchema>;
