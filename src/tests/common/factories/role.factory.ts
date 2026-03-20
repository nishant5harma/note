// src/tests/common/factories/role.factory.ts

import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";
import type { PermissionData } from "./permission.factory.js";

export interface RoleData {
  id?: string;
  name: string;
  permissions?: PermissionData[];
}

export const roleFactory = Factory.define<RoleData>(({ onCreate }) => {
  onCreate(async (role) => {
    const { permissions, ...roleData } = role;
    // Construct data object conditionally to satisfy exactOptionalPropertyTypes
    const data: any = { ...roleData };
    if (permissions && permissions.length > 0) {
      data.permissions = {
        create: permissions.map((p) => ({ permissionId: p.id })),
      };
    }
    return prisma.role.create({ data }) as any;
  });

  return {
    name: `Role-${faker.person.jobTitle()}-${faker.string.alphanumeric(5)}`,
  };
});
