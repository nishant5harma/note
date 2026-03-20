// src/tests/common/helpers/auth.helper.ts
import { signAccessToken } from "@/utils/jwt.utils.js";
import { prisma } from "@/db/db.js";
import { permissionFactory } from "../factories/permission.factory.js";
import { roleFactory } from "../factories/role.factory.js";

/**
 * Generates a valid JWT for testing purposes.
 * @param user The user object created by a factory (must have an id)
 * @returns A signed JWT string
 */
export function generateAuthToken(user: { id: string }): string {
  if (!user.id) {
    throw new Error("Cannot generate auth token: User has no ID.");
  }
  return signAccessToken(user.id);
}

/**
 * Helper to setup RBAC for integration tests.
 */
export async function grantPermissions(
  userId: string,
  permissionKeys: string[]
) {
  // 1. Create/Fetch permissions
  const permissions = await Promise.all(
    permissionKeys.map(async (key) => {
      const existing = await prisma.permission.findUnique({ where: { key } });
      if (existing) return existing;
      return permissionFactory.create({ key });
    })
  );

  // 2. Create the role
  // We use type assertion to satisfy the factory's interface
  // while ensuring 'id' is definitely a string.
  const role = await roleFactory.create({
    permissions: permissions.map((p) => ({
      id: p.id as string,
      key: p.key,
    })),
  });

  // 3. Link role to user
  // role.id is cast to string because the factory guarantees creation
  await prisma.userRole.create({
    data: {
      userId,
      roleId: role.id as string,
    },
  });
}
