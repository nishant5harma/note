// src/tests/common/factories/lead.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const leadFactory = Factory.define(({ onCreate }) => {
    onCreate(async (lead) => {
        return prisma.lead.create({
            data: {
                ...lead,
                // Prisma requires explicit JSON input type
                payload: lead.payload,
            },
        });
    });
    return {
        id: faker.string.nanoid(),
        externalId: null,
        dedupeHash: null,
        source: "test",
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.string.numeric(10),
        payload: {}, // ✅ valid JSON
        status: "NEW",
        stage: "INBOUND",
        priority: "NORMAL",
        assignedToId: null,
        assignedTeamId: null,
        assignedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
});
//# sourceMappingURL=lead.factory.js.map