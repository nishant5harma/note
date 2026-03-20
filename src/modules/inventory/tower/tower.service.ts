// /src/modules/inventory/tower/tower.service.ts

import { prisma } from "@/db/db.js";

export async function createTower(data: any) {
  return prisma.tower.create({ data });
}

export async function getTower(id: string) {
  return prisma.tower.findUnique({ where: { id } });
}

export async function listTowersByProject(projectId?: string) {
  const where: any = {};
  if (projectId) where.projectId = projectId;
  return prisma.tower.findMany({ where, orderBy: { createdAt: "asc" } });
}

export async function updateTower(id: string, data: any) {
  return prisma.tower.update({ where: { id }, data });
}

export async function deleteTower(id: string) {
  return prisma.tower.delete({ where: { id } });
}
