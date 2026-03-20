// src/tests/common/factories/project.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";
import { type Project } from "@prisma/client";

export const projectFactory = Factory.define<Project>(({ onCreate }) => {
  // Use 'as any' to bypass the JsonValue (output) vs InputJsonValue (input) conflict
  onCreate((project) => prisma.project.create({ data: project as any }));

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
  } as Project;
});
