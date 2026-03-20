// src/tests/common/factories/team.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const teamFactory = Factory.define(({ onCreate }) => {
    onCreate((team) => prisma.team.create({ data: team }));
    return {
        name: faker.company.name(),
    };
});
//# sourceMappingURL=team.factory.js.map