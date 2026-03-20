import { Factory } from "fishery";
export declare const teamMemberFactory: Factory<{
    id: string;
    createdAt: Date;
    userId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    teamId: string;
    joinedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
}, any, {
    id: string;
    createdAt: Date;
    userId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    teamId: string;
    joinedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
}, import("fishery").DeepPartialObject<{
    id: string;
    createdAt: Date;
    userId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    teamId: string;
    joinedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
}>>;
//# sourceMappingURL=team-member.factory.d.ts.map