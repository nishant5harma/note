// src/tests/common/factories/role.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const roleFactory = Factory.define(({ onCreate }) => {
    onCreate(async (role) => {
        const { permissions, ...roleData } = role;
        // Construct data object conditionally to satisfy exactOptionalPropertyTypes
        const data = { ...roleData };
        if (permissions && permissions.length > 0) {
            data.permissions = {
                create: permissions.map((p) => ({ permissionId: p.id })),
            };
        }
        return prisma.role.create({ data });
    });
    return {
        name: `Role-${faker.person.jobTitle()}-${faker.string.alphanumeric(5)}`,
    };
});
//# sourceMappingURL=role.factory.js.map