// /src/modules/inventory/project/project.service.ts
import { prisma } from "../../../db/db.js";
export async function createProject(data) {
    return prisma.project.create({ data });
}
export async function listProjects() {
    return prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });
}
export async function updateProject(id, data) {
    return prisma.project.update({
        where: { id },
        data,
    });
}
export async function deleteProject(id) {
    return prisma.project.delete({ where: { id } });
}
//# sourceMappingURL=project.service.js.map