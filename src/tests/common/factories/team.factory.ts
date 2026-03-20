// src/tests/common/factories/team.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";
import { prisma } from "@/db/db.js";

interface TeamData {
  id?: string;
  name: string;
}

export const teamFactory = Factory.define<TeamData>(({ onCreate }) => {
  onCreate((team) => prisma.team.create({ data: team as any }));

  return {
    name: faker.company.name(),
  };
});
