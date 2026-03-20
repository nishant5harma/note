import { Queue } from "bullmq";
export declare const ASSIGNMENT_QUEUE_NAME: string;
export declare const ASSIGNMENT_CHECK_QUEUE_NAME: string;
export declare const ESCALATION_QUEUE_NAME: string;
export declare const TEAM_ASSIGNMENT_QUEUE_NAME: string;
export declare const assignmentQueue: Queue<any, any, string, any, any, string>;
export declare const assignmentCheckQueue: Queue<any, any, string, any, any, string>;
export declare const escalationQueue: Queue<any, any, string, any, any, string>;
export declare const teamAssignmentQueue: Queue<any, any, string, any, any, string>;
/**
 * Enqueue an assignment check (delayed) with optional delayMs.
 * Returns jobId (string) so callers can persist/cancel it if needed.
 *
 * Use Case:
 *  - this allows for any immediate manual assignments to occur first
 *  - also helps db to settle in case of high concurrency and tx delays
 *  - helps workers to not immediately pick up the job and avoid failing unable to data in db
 */
export declare function enqueueAssignmentCheckJob(leadId: string, assignmentId: string, opts?: {
    delayMs?: number;
    attempt?: number;
}): Promise<string>;
/**
 * Enqueue a fresh assignment job (immediate)
 * Returns jobId so caller can persist it to DB (LeadAssignment.meta.jobId)
 */
export declare function enqueueAssignmentJob(leadId: string, assignmentId: string): Promise<string>;
//# sourceMappingURL=queue.d.ts.map