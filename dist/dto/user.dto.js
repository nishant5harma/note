// src/dto/user.dto.ts
import { prisma } from "../db/db.js";
/**
 * Convert a userId -> UserDTO
 */
export const userIdToUserDTO = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: { include: { role: true } },
            teamMembers: { include: { team: true } },
        },
    });
    if (!user)
        throw new Error("User not found");
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((userRole) => userRole.role.name),
        teamMembers: user.teamMembers.map((tm) => ({
            teamId: tm.teamId,
            teamName: tm.team?.name ?? null,
            role: String(tm.role),
            joinedAt: tm.joinedAt.toISOString(),
        })),
    };
};
//# sourceMappingURL=user.dto.js.map