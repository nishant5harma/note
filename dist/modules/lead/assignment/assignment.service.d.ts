/**
 * Called by intake after creating Lead + LeadAssignment rows.
 * Accepts leadId and assignmentId (the leadAssignment row).
 */
export declare function enqueueInitialAssignment(leadId: string, assignmentId: string): Promise<void>;
/**
 * Manual assign: used by API to manually assign a lead to a user.
 * This also updates LeadAssignment as audit trail.
 *
 * Behavior enhancements:
 *  - cancels pending queue jobs referenced in LeadAssignment.meta (jobId/checkJobId/teamJobId)
 *  - atomically updates capacity.used counters (decrement old, increment new)
 */
export declare function manualAssignLead(leadId: string, assignmentId: string | null, userId: string, actorId: string): Promise<void>;
//# sourceMappingURL=assignment.service.d.ts.map