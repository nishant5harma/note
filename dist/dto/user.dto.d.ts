/**
 * UserDTO now returns multi-team memberships via teamMembers[]
 */
export type TeamMemberDTO = {
    teamId: string;
    teamName?: string | null;
    role: string;
    joinedAt: string;
};
export type UserDTO = {
    id: string;
    name: string;
    email: string;
    roles: string[];
    teamMembers: TeamMemberDTO[];
};
/**
 * Convert a userId -> UserDTO
 */
export declare const userIdToUserDTO: (userId: string) => Promise<UserDTO>;
//# sourceMappingURL=user.dto.d.ts.map