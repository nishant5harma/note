import type { CreateUserData } from "./types/create-user-data.type.js";
import type { AuthUser } from "../../types/auth-request.js";
export declare const UserService: {
    createUser: typeof createUser;
    listUsers: typeof listUsers;
    findUserById: typeof findUserById;
};
export default UserService;
/**
 * Create a new user with multiple roles.
 * NOTE: legacy user.teamId column removed — we use TeamMember for membership.
 */
declare function createUser(data: CreateUserData, currentUser?: AuthUser): Promise<{
    user: {
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
        teamMembers: {
            teamId: string;
            teamName: string | null;
            role: string;
            joinedAt: string;
        }[];
    };
}>;
/**
 * List users including their team memberships (via TeamMember).
 */
declare function listUsers(currentUser?: AuthUser): Promise<{
    users: {
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
        teamMembers: {
            teamId: string;
            teamName: string;
            role: import("@prisma/client").$Enums.TeamMemberRole;
            joinedAt: Date;
        }[];
    }[];
}>;
/**
 * Find a specific user (with team memberships).
 */
declare function findUserById(id: string, currentUser?: AuthUser): Promise<{
    user: {
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
        teamMembers: {
            teamId: string;
            teamName: string;
            role: import("@prisma/client").$Enums.TeamMemberRole;
            joinedAt: Date;
        }[];
    };
}>;
//# sourceMappingURL=user.service.d.ts.map