// /src/modules/inventory/tower/tower.service.ts
import { prisma } from "../../../db/db.js";
export async function createTower(data) {
    return prisma.tower.create({ data });
}
export async function getTower(id) {
    return prisma.tower.findUnique({ where: { id } });
}
export async function listTowersByProject(projectId) {
    const where = {};
    if (projectId)
        where.projectId = projectId;
    return prisma.tower.findMany({ where, orderBy: { createdAt: "asc" } });
}
export async function updateTower(id, data) {
    return prisma.tower.update({ where: { id }, data });
}
export async function deleteTower(id) {
    return prisma.tower.delete({ where: { id } });
}
//# sourceMappingURL=tower.service.js.map