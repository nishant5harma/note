// src/tests/common/factories/project.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const projectFactory = Factory.define(({ onCreate }) => {
    // Use 'as any' to bypass the JsonValue (output) vs InputJsonValue (input) conflict
    onCreate((project) => prisma.project.create({ data: project }));
    return {
        id: faker.string.uuid(),
        name: faker.company.name(),
        developer: faker.company.name(),
        city: faker.location.city(),
        locality: faker.location.streetAddress(),
        address: faker.location.streetAddress(),
        meta: {},
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
});
//# sourceMappingURL=project.factory.js.map