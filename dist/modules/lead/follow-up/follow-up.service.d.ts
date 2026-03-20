import type { LeadPriority, LeadStage, LeadStatus } from "@prisma/client";
/**
 * createFollowUp - create a followup row (no capacity changes)
 */
export declare function createFollowUp(leadId: string, payload: {
    assignedTo?: string | null;
    dueAt?: string | Date | null;
    note?: string | null;
    disposition?: string | null;
    rating?: number | null;
    status?: string | null;
}, actorId?: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    leadId: string;
    status: string;
    note: string | null;
    assignedTo: string | null;
    dueAt: Date | null;
    disposition: string | null;
    rating: number | null;
}>;
/**
 * updateLeadStatus - update lead status/stage/priority atomically. This:
 *  - checks current lead row
 *  - if status becomes terminal, releases capacity for assignedTo (if any)
 *  - updates lead row
 *  - creates a followup note capturing previous state
 *  - creates LeadStageHistory if stage changed
 */
export declare function updateLeadStatus(leadId: string, dto: {
    status: LeadStatus;
    stage?: LeadStage | null;
    priority?: LeadPriority | null;
    disposition?: string | null;
    note?: string | null;
    rating?: number | null;
}, actorId?: string): Promise<{
    lead: {
        id: string;
        createdAt: Date;
        name: string | null;
        email: string | null;
        phone: string | null;
        updatedAt: Date;
        assignedAt: Date | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.LeadStatus;
        source: string | null;
        priority: import("@prisma/client").$Enums.LeadPriority;
        externalId: string | null;
        dedupeHash: string | null;
        stage: import("@prisma/client").$Enums.LeadStage;
        assignedToId: string | null;
        assignedTeamId: string | null;
    };
    followUp: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        leadId: string;
        status: string;
        note: string | null;
        assignedTo: string | null;
        dueAt: Date | null;
        disposition: string | null;
        rating: number | null;
    };
}>;
/**
 * listFollowUps - simple listing with pagination
 */
export declare function listFollowUps(leadId: string, opts?: {
    page?: number;
    limit?: number;
}): Promise<{
    items: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        leadId: string;
        status: string;
        note: string | null;
        assignedTo: string | null;
        dueAt: Date | null;
        disposition: string | null;
        rating: number | null;
    }[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}>;
/**
 * Admin / analytics helpers:
 * - list by disposition, export CSV (stub)
 * - stage funnel counts
 * - ratings aggregation (by org/team/user)
 */
export declare function listFollowUpsByFilter(filter: {
    disposition?: string | null;
    assignedTo?: string | null;
    from?: string | null;
    to?: string | null;
    page?: number;
    limit?: number;
}): Promise<{
    items: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        leadId: string;
        status: string;
        note: string | null;
        assignedTo: string | null;
        dueAt: Date | null;
        disposition: string | null;
        rating: number | null;
    }[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}>;
/**
 * stageFunnel - returns counts per stage (for UI charts)
 * optionally scoped by teamId or userId advantage
 */
export declare function stageFunnel(scope?: {
    teamId?: string;
    userId?: string;
}): Promise<{
    stage: import("@prisma/client").$Enums.LeadStage;
    count: number;
}[]>;
/**
 * ratingsAggregation - returns avg rating and counts grouped by stage or user/team
 */
export declare function ratingsAggregation(scope?: {
    groupBy?: "stage" | "assignedTo" | "team";
    teamId?: string;
}): Promise<{
    stage: string;
    avgRating: number | null;
    cnt: number;
}[]>;
export declare function listLeadStageHistory(leadId: string): Promise<{
    id: string;
    createdAt: Date;
    leadId: string;
    note: string | null;
    fromStage: import("@prisma/client").$Enums.LeadStage | null;
    toStage: import("@prisma/client").$Enums.LeadStage;
    changedBy: string | null;
}[]>;
//# sourceMappingURL=follow-up.service.d.ts.map