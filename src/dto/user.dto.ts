// src/dto/user.dto.ts
import { prisma } from "@/db/db.js";

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
  roles: string[]; // role names
  teamMembers: TeamMemberDTO[]; // new multi-team membership representation
};

/**
 * Convert a userId -> UserDTO
 */
export const userIdToUserDTO = async (userId: string): Promise<UserDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
      teamMembers: { include: { team: true } },
    },
  });

  if (!user) throw new Error("User not found");

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
