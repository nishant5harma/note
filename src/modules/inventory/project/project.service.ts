// /src/modules/inventory/project/project.service.ts

import { prisma } from "@/db/db.js";

export async function createProject(data: any) {
  return prisma.project.create({ data });
}

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function updateProject(id: string, data: any) {
  return prisma.project.update({
    where: { id },
    data,
  });
}

export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
