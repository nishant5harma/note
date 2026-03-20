import type { AuthUser } from "../../types/auth-request.js";
export declare const TeamService: {
    createTeam: typeof createTeam;
    getTeamById: typeof getTeamById;
    listTeams: typeof listTeams;
    updateTeam: typeof updateTeam;
    deleteTeam: typeof deleteTeam;
    assignLead: typeof assignLead;
    listTeamUsers: typeof listTeamUsers;
    assignMembers: typeof assignMembers;
    bulkAssignMembers: typeof bulkAssignMembers;
    removeMember: typeof removeMember;
    bulkRemoveMembers: typeof bulkRemoveMembers;
    createTransferRequest: typeof createTransferRequest;
    createJoinRequest: typeof createJoinRequest;
    listRequests: typeof listRequests;
    respondToRequest: typeof respondToRequest;
    listTeamMembers: typeof listTeamMembers;
};
export default TeamService;
declare function createTeam(payload: {
    name: string;
    teamLeadId?: string | null;
}): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
}>;
declare function getTeamById(id: string): Promise<{
    members: ({
        user: {
            roles: ({
                role: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    description: string | null;
                };
            } & {
                userId: string;
                roleId: string;
                assignedAt: Date;
            })[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            phone: string | null;
            passwordHash: string;
            isActive: boolean;
            updatedAt: Date;
            version: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        role: import("@prisma/client").$Enums.TeamMemberRole;
        teamId: string;
        joinedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
}>;
declare function listTeams(): Promise<({
    members: ({
        user: {
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            phone: string | null;
            passwordHash: string;
            isActive: boolean;
            updatedAt: Date;
            version: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        role: import("@prisma/client").$Enums.TeamMemberRole;
        teamId: string;
        joinedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    })[];
} & {
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
})[]>;
declare function updateTeam(id: string, patch: {
    name?: string;
    leadId?: string | null;
}): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
}>;
declare function deleteTeam(id: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
}>;
declare function assignLead(teamId: string, teamLeadId: string): Promise<{
    id: string;
    createdAt: Date;
    name: string;
    updatedAt: Date;
    teamLeadId: string | null;
}>;
declare function listTeamUsers(teamId: string): Promise<{
    id: string;
    name: string;
    email: string;
    roles: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        description: string | null;
    }[];
    teamRole: import("@prisma/client").$Enums.TeamMemberRole;
    joinedAt: Date;
}[]>;
/**
 * Assign one or multiple members to a team.
 * If caller has teamWrite=true they perform direct assignment.
 * If caller is team lead they create TeamRequest(s) (pending) which HR must approve.
 */
declare function assignMembers(teamId: string, userIds: string[], role?: "MEMBER" | "ASSISTANT_LEAD" | "LEAD", actor?: AuthUser, actorHasTeamWrite?: boolean): Promise<{
    assigned: any[];
    skipped: any[];
    requests: any[];
}>;
declare function bulkAssignMembers(teamId: string, userIds: string[], role?: "MEMBER" | "ASSISTANT_LEAD" | "LEAD", actor?: AuthUser, actorHasTeamWrite?: boolean): Promise<{
    assigned: any[];
    skipped: any[];
    requests: any[];
}>;
/**
 * Remove a member. If actorHasTeamWrite -> direct removal.
 * If actor is team lead -> create a remove request (pending).
 */
declare function removeMember(teamId: string, memberUserId: string, reason: string, actor?: AuthUser, actorHasTeamWrite?: boolean): Promise<{
    removed: boolean;
    request?: undefined;
} | {
    request: {
        id: string;
        createdAt: Date;
        type: string;
        requesterId: string;
        targetUserId: string;
        fromTeamId: string | null;
        toTeamId: string | null;
        status: string;
        note: string | null;
        respondedBy: string | null;
        respondedAt: Date | null;
    };
    removed?: undefined;
}>;
declare function bulkRemoveMembers(teamId: string, userIds: string[], reason: string, actor?: AuthUser, actorHasTeamWrite?: boolean): Promise<{
    removed: string[];
    requests: any[];
    failed: any[];
}>;
/**
 * Create transfer request (team lead requests transfer of member to another team)
 */
declare function createTransferRequest(fromTeamId: string, memberUserId: string, toTeamId: string, actor?: AuthUser): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    requesterId: string;
    targetUserId: string;
    fromTeamId: string | null;
    toTeamId: string | null;
    status: string;
    note: string | null;
    respondedBy: string | null;
    respondedAt: Date | null;
}>;
/**
 * Create join request (team lead or user requests a teamless user be added)
 */
declare function createJoinRequest(teamId: string, targetUserId: string, actor: AuthUser): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    requesterId: string;
    targetUserId: string;
    fromTeamId: string | null;
    toTeamId: string | null;
    status: string;
    note: string | null;
    respondedBy: string | null;
    respondedAt: Date | null;
}>;
/**
 * List pending requests (optionally filter)
 */
declare function listRequests(filter?: {
    status?: string;
    type?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    requesterId: string;
    targetUserId: string;
    fromTeamId: string | null;
    toTeamId: string | null;
    status: string;
    note: string | null;
    respondedBy: string | null;
    respondedAt: Date | null;
}[]>;
/**
 * Approve/reject a TeamRequest. Approver must have teamWrite permission (HR/manager).
 * On approval: perform assignment/removal/transfer/join as appropriate inside a transaction.
 */
declare function respondToRequest(requestId: string, approve: boolean, actor?: AuthUser, note?: string): Promise<{
    id: string;
    createdAt: Date;
    type: string;
    requesterId: string;
    targetUserId: string;
    fromTeamId: string | null;
    toTeamId: string | null;
    status: string;
    note: string | null;
    respondedBy: string | null;
    respondedAt: Date | null;
} | {
    updatedReq: {
        id: string;
        createdAt: Date;
        type: string;
        requesterId: string;
        targetUserId: string;
        fromTeamId: string | null;
        toTeamId: string | null;
        status: string;
        note: string | null;
        respondedBy: string | null;
        respondedAt: Date | null;
    };
    created: {
        id: string;
        createdAt: Date;
        userId: string;
        role: import("@prisma/client").$Enums.TeamMemberRole;
        teamId: string;
        joinedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    };
} | {
    request: {
        id: string;
        createdAt: Date;
        type: string;
        requesterId: string;
        targetUserId: string;
        fromTeamId: string | null;
        toTeamId: string | null;
        status: string;
        note: string | null;
        respondedBy: string | null;
        respondedAt: Date | null;
    };
    teamMember: {
        id: string;
        createdAt: Date;
        userId: string;
        role: import("@prisma/client").$Enums.TeamMemberRole;
        teamId: string;
        joinedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
    };
} | {
    request: {
        id: string;
        createdAt: Date;
        type: string;
        requesterId: string;
        targetUserId: string;
        fromTeamId: string | null;
        toTeamId: string | null;
        status: string;
        note: string | null;
        respondedBy: string | null;
        respondedAt: Date | null;
    };
    teamMember?: undefined;
}>;
/**
 * list members using TeamMember join table with user info
 */
declare function listTeamMembers(teamId: string, opts?: {
    limit?: number;
    offset?: number;
}): Promise<({
    user: {
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                description: string | null;
            };
        } & {
            userId: string;
            roleId: string;
            assignedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        phone: string | null;
        passwordHash: string;
        isActive: boolean;
        updatedAt: Date;
        version: number;
    };
} & {
    id: string;
    createdAt: Date;
    userId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    teamId: string;
    joinedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
})[]>;
//# sourceMappingURL=team.service.d.ts.map