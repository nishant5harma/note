// src/tests/common/factories/lead.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";
import { Prisma, type Lead } from "@prisma/client";

export const leadFactory = Factory.define<Lead>(({ onCreate }) => {
  onCreate(async (lead) => {
    return prisma.lead.create({
      data: {
        ...lead,
        // Prisma requires explicit JSON input type
        payload: lead.payload as Prisma.InputJsonValue,
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
