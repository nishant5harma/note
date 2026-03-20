export declare const LeadService: {
    listLeads: typeof listLeads;
    getLeadById: typeof getLeadById;
};
declare function listLeads(params: {
    page: number;
    limit: number;
    q?: string;
    source?: string;
    status?: string;
    stage?: string;
    priority?: string;
    assignedToId?: string;
    assignedTeamId?: string;
    from?: string;
    to?: string;
}): Promise<{
    ok: boolean;
    items: {
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        phone: string;
        updatedAt: Date;
        assignedAt: Date;
        _count: {
            notes: number;
            followUps: number;
            escalations: number;
        };
        status: import("@prisma/client").$Enums.LeadStatus;
        source: string;
        externalId: string;
        stage: import("@prisma/client").$Enums.LeadStage;
        priority: import("@prisma/client").$Enums.LeadPriority;
        assignedToId: string;
        assignments: {
            id: string;
            createdAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue;
            assignedBy: string;
            assignedTo: string;
            method: string;
            attempt: number;
        }[];
        webhookEvents: {
            id: string;
            createdAt: Date;
            externalId: string;
            provider: string;
            dedupeHash: string;
        }[];
        assignedTeam: {
            id: string;
            name: string;
            teamLeadId: string;
        };
        assignedTeamId: string;
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}>;
declare function getLeadById(id: string): Promise<{
    ok: boolean;
    data: {
        assignments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            assignedBy: string | null;
            leadId: string;
            assignedTo: string | null;
            method: string;
            attempt: number;
        }[];
        webhookEvents: {
            id: string;
            createdAt: Date;
            payload: import("@prisma/client/runtime/library").JsonValue;
            leadId: string | null;
            externalId: string | null;
            provider: string;
            rawBody: string | null;
            headers: import("@prisma/client/runtime/library").JsonValue | null;
            dedupeHash: string | null;
        }[];
        notes: {
            id: string;
            createdAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            leadId: string;
            authorId: string | null;
            text: string;
        }[];
        followUps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            status: string;
            note: string | null;
            leadId: string;
            assignedTo: string | null;
            dueAt: Date | null;
            disposition: string | null;
            rating: number | null;
        }[];
        assignedTeam: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            teamLeadId: string | null;
        };
        escalations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            leadId: string;
            assignmentId: string | null;
            notifiedUsers: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        stageHistory: {
            id: string;
            createdAt: Date;
            note: string | null;
            leadId: string;
            fromStage: import("@prisma/client").$Enums.LeadStage | null;
            toStage: import("@prisma/client").$Enums.LeadStage;
            changedBy: string | null;
        }[];
    } & {
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
        externalId: string | null;
        dedupeHash: string | null;
        stage: import("@prisma/client").$Enums.LeadStage;
        priority: import("@prisma/client").$Enums.LeadPriority;
        assignedToId: string | null;
        assignedTeamId: string | null;
    };
}>;
export {};
//# sourceMappingURL=lead.service.d.ts.map