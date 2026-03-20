// src/tests/common/factories/user.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";
import type { RoleData } from "./role.factory.js";

interface UserData {
  id?: string;
  email: string;
  name: string;
  passwordHash: string;
  roles?: RoleData[];
}

export const userFactory = Factory.define<UserData>(({ onCreate }) => {
  onCreate(async (user) => {
    const { roles, ...userData } = user;
    const data: any = { ...userData };
    if (roles && roles.length > 0) {
      data.roles = {
        create: roles.map((r) => ({ roleId: r.id })),
      };
    }
    return prisma.user.create({
      data,
      include: { roles: true },
    }) as any;
  });

  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    passwordHash: "bcrypt_hashed_dummy_string",
  };
});
