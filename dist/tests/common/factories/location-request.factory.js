// src/tests/common/factories/location-request.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const locationRequestFactory = Factory.define(({ onCreate }) => {
    onCreate((lr) => {
        if (!lr.requesterId || !lr.targetId) {
            throw new Error("locationRequestFactory requires requesterId and targetId");
        }
        const { updatedAt, ...data } = lr;
        return prisma.locationRequest.create({ data });
    });
    return {
        id: faker.string.uuid(),
        requesterId: undefined,
        targetId: undefined,
        status: "PENDING",
        note: faker.lorem.sentence(),
        expiresAt: new Date(Date.now() + 60000),
        fulfilledAt: null,
        respondedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
});
//# sourceMappingURL=location-request.factory.js.map