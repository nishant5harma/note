// src/tests/common/factories/device.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "../../../db/db.js";
export const deviceFactory = Factory.define(({ onCreate }) => {
    onCreate((device) => {
        return prisma.device.create({
            data: device,
        });
    });
    return {
        // Standard Prisma Fields
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        platform: "android",
        pushToken: faker.string.alphanumeric(32),
        meta: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        // New Submodule Fields (Added safely)
        deviceId: faker.string.uuid(),
        lastSeenAt: new Date(),
    };
});
//# sourceMappingURL=device.factory.js.map