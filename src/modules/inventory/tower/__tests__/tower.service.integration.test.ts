// src/modules/inventory/tower/__tests__/tower.service.integration.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";

/* ------------------------------------------------------------------ */
/* 📦 IMPORT SERVICE                                                   */
/* ------------------------------------------------------------------ */
import {
  createTower,
  getTower,
  listTowersByProject,
  updateTower,
  deleteTower,
} from "../tower.service.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Tower Service (integration)", () => {
  let projectId: string;

  beforeEach(async () => {
    const project = await prisma.project.create({
      data: { name: "Test Project" },
    });
    projectId = project.id;
  });

  it("creates a tower", async () => {
    const t = await createTower({
      projectId,
      name: "Tower A",
      floors: 10,
    });

    expect(t.id).toBeDefined();
    expect(t.name).toBe("Tower A");
    expect(t.projectId).toBe(projectId);
  });

  it("gets a tower by id", async () => {
    const tower = await prisma.tower.create({
      data: { projectId, name: "Tower B" },
    });

    const found = await getTower(tower.id);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(tower.id);
  });

  it("lists towers filtered by project", async () => {
    await prisma.tower.createMany({
      data: [
        { projectId, name: "T1" },
        { projectId, name: "T2" },
      ],
    });

    const items = await listTowersByProject(projectId);

    expect(items).toHaveLength(2);
    expect(items[0]!.projectId).toBe(projectId);
  });

  it("lists all towers when no projectId provided", async () => {
    const p2 = await prisma.project.create({ data: { name: "P2" } });

    await prisma.tower.createMany({
      data: [
        { projectId, name: "T1" },
        { projectId: p2.id, name: "T2" },
      ],
    });

    const items = await listTowersByProject();

    expect(items).toHaveLength(2);
  });

  it("updates a tower", async () => {
    const tower = await prisma.tower.create({
      data: { projectId, name: "Old" },
    });

    const updated = await updateTower(tower.id, {
      name: "New",
      floors: 20,
    });

    expect(updated.name).toBe("New");
    expect(updated.floors).toBe(20);
  });

  it("deletes a tower", async () => {
    const tower = await prisma.tower.create({
      data: { projectId, name: "Delete Me" },
    });

    await deleteTower(tower.id);

    const found = await prisma.tower.findUnique({
      where: { id: tower.id },
    });

    expect(found).toBeNull();
  });
});
