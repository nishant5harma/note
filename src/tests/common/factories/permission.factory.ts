// src/tests/common/factories/permission.factory.ts

import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";

export interface PermissionData {
  id?: string;
  key: string;
}

export const permissionFactory = Factory.define<PermissionData>(
  ({ onCreate }) => {
    onCreate((permission) =>
      prisma.permission.create({ data: permission as any })
    );
    return { key: `perm.${faker.string.uuid()}` };
  }
);
