// src/tests/common/factories/user.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const userFactory = Factory.define(({ onCreate }) => {
    onCreate(async (user) => {
        const { roles, ...userData } = user;
        const data = { ...userData };
        if (roles && roles.length > 0) {
            data.roles = {
                create: roles.map((r) => ({ roleId: r.id })),
            };
        }
        return prisma.user.create({
            data,
            include: { roles: true },
        });
    });
    return {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        passwordHash: "bcrypt_hashed_dummy_string",
    };
});
//# sourceMappingURL=user.factory.js.map