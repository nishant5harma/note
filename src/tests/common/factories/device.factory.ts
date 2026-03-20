// src/tests/common/factories/device.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";
import { type Device } from "@prisma/client";

// Define an interface that makes DB-generated fields optional for the .build() phase
export interface DeviceData extends Partial<Device> {
  userId: string; // Keep userId required
}

export const deviceFactory = Factory.define<DeviceData>(({ onCreate }) => {
  onCreate((device) => {
    return prisma.device.create({
      data: device as any,
    }) as Promise<Device>;
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
  } as DeviceData;
});
