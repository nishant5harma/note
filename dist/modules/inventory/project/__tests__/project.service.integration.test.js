// src/modules/inventory/project/__tests__/project.service.integration.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { createProject, listProjects, updateProject, deleteProject, } from "../project.service.js";
describe("Inventory Project Service (integration)", () => {
    beforeEach(async () => {
        // Global integration setup already truncates DB
        // No manual cleanup needed here
    });
    it("creates a project", async () => {
        const project = await createProject({
            name: "Project A",
            city: "Delhi",
            locality: "South Delhi",
        });
        expect(project.id).toBeDefined();
        expect(project.name).toBe("Project A");
    });
    it("lists projects ordered by createdAt desc", async () => {
        await createProject({ name: "Old Project" });
        await new Promise((r) => setTimeout(r, 10));
        await createProject({ name: "New Project" });
        const projects = await listProjects();
        expect(projects).toHaveLength(2);
        expect(projects[0].name).toBe("New Project");
        expect(projects[1].name).toBe("Old Project");
    });
    it("updates a project", async () => {
        const project = await createProject({
            name: "Initial",
            city: "Delhi",
        });
        const updated = await updateProject(project.id, {
            name: "Updated",
            city: "Mumbai",
        });
        expect(updated.name).toBe("Updated");
        expect(updated.city).toBe("Mumbai");
    });
    it("deletes a project", async () => {
        const project = await createProject({
            name: "To Delete",
        });
        await deleteProject(project.id);
        const found = await prisma.project.findUnique({
            where: { id: project.id },
        });
        expect(found).toBeNull();
    });
});
//# sourceMappingURL=project.service.integration.test.js.map