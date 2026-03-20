// src/tests/common/factories/permission.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const permissionFactory = Factory.define(({ onCreate }) => {
    onCreate((permission) => prisma.permission.create({ data: permission }));
    return { key: `perm.${faker.string.uuid()}` };
});
//# sourceMappingURL=permission.factory.js.map