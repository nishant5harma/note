// src/modules/user/user.service.ts
import bcrypt from "bcrypt";
import type { CreateUserData } from "./types/create-user-data.type.js";
import { prisma } from "@/db/db.js";
import { logAudit } from "@/utils/audit.util.js";
import type { AuthUser } from "@/types/auth-request.js";
import { NotFoundError, BadRequestError } from "@/utils/http-errors.util.js";

const SALT = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// Exported UserService object
export const UserService = {
  createUser,
  listUsers,
  findUserById,
  // add more functions as needed
};

export default UserService;

/**
 * Create a new user with multiple roles.
 * NOTE: legacy user.teamId column removed — we use TeamMember for membership.
 */
async function createUser(data: CreateUserData, currentUser?: AuthUser) {
  const { name, email, password, roleIds, teamId } = data;

  if (!roleIds || roleIds.length === 0) {
    throw new BadRequestError("At least one roleId is required");
  }

  const passwordHash = await bcrypt.hash(password, SALT);

  // create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roles: {
        create: roleIds.map((roleId) => ({
          role: { connect: { id: roleId } },
        })),
      },
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  // If caller supplied teamId (optional convenience), create TeamMember entry.
  if (teamId) {
    // validate team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      // revert user creation? For now throw — caller should pass valid teamId.
      throw new BadRequestError("Invalid teamId provided");
    }
    await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId,
        role: "MEMBER",
        meta: { assignedBy: currentUser?.id ?? null },
      },
    });
  }

  await logAudit({
    userId: currentUser?.id ?? null,
    action: "create",
    resource: "user",
    resourceId: user.id,
    payload: {
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
      teamId: teamId ?? null,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      teamMembers: teamId
        ? [
            {
              teamId,
              teamName:
                (await prisma.team.findUnique({ where: { id: teamId } }))
                  ?.name ?? null,
              role: "MEMBER",
              joinedAt: new Date().toISOString(),
            },
          ]
        : [],
    },
  };
}

/**
 * List users including their team memberships (via TeamMember).
 */
async function listUsers(currentUser?: AuthUser) {
  const users = await prisma.user.findMany({
    include: {
      roles: { include: { role: true } },
      teamMembers: { include: { team: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await logAudit({
    userId: currentUser?.id ?? null,
    action: "list",
    resource: "user",
    resourceId: null,
    payload: { count: users.length },
  });

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles.map((r) => r.role),
      teamMembers: u.teamMembers.map((tm) => ({
        teamId: tm.teamId,
        teamName: tm.team?.name ?? null,
        role: tm.role,
        joinedAt: tm.joinedAt,
      })),
    })),
  };
}

/**
 * Find a specific user (with team memberships).
 */
async function findUserById(id: string, currentUser?: AuthUser) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: { include: { role: true } },
      teamMembers: { include: { team: true } },
    },
  });

  if (!user) throw new NotFoundError("User not found");

  await logAudit({
    userId: currentUser?.id ?? null,
    action: "read",
    resource: "user",
    resourceId: user.id,
    payload: {
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
      teamIds: user.teamMembers.map((tm) => tm.teamId),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r) => r.role),
      teamMembers: user.teamMembers.map((tm) => ({
        teamId: tm.teamId,
        teamName: tm.team?.name ?? null,
        role: tm.role,
        joinedAt: tm.joinedAt,
      })),
    },
  };
}
