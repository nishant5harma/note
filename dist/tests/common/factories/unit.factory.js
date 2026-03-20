// src/tests/common/factories/unit.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const unitFactory = Factory.define(({ onCreate }) => {
    onCreate((unit) => prisma.unit.create({ data: unit }));
    return {
        id: faker.string.uuid(),
        projectId: faker.string.uuid(),
        status: "AVAILABLE",
        meta: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    };
});
//# sourceMappingURL=unit.factory.js.map