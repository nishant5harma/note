import { Factory } from "fishery";
export declare const teamMemberFactory: Factory<{
    id: string;
    teamId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    userId: string;
    joinedAt: Date;
}, any, {
    id: string;
    teamId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    userId: string;
    joinedAt: Date;
}, import("fishery").DeepPartialObject<{
    id: string;
    teamId: string;
    role: import("@prisma/client").$Enums.TeamMemberRole;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    userId: string;
    joinedAt: Date;
}>>;
//# sourceMappingURL=team-member.factory.d.ts.map