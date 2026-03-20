// src/modules/inventory/tower/__tests__/tower.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import type { Express } from "express";

/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "@/tests/common/mocks/socket.mock.js";

import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createProjectWithUnit } from "@/tests/common/factories/scenario/inventory.scenario.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Tower Routes (integration)", () => {
  let app: Express;
  let projectId: string;

  beforeEach(async () => {
    app = await createTestApp();

    // minimal setup: scenario handles correctness
    const { project } = await createProjectWithUnit();
    projectId = project.id;
  });

  it("creates tower (inventory.write)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const res = await request(app)
      .post("/api/inventory/towers")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId,
        name: "Tower X",
        floors: 15,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Tower X");
  });

  it("lists towers (inventory.read)", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    await prisma.tower.create({
      data: { projectId, name: "Visible Tower" },
    });

    const res = await request(app)
      .get("/api/inventory/towers")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("gets a tower by id", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    const tower = await prisma.tower.create({
      data: { projectId, name: "Fetch Me" },
    });

    const res = await request(app)
      .get(`/api/inventory/towers/${tower.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(tower.id);
  });

  it("updates tower (inventory.write)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const tower = await prisma.tower.create({
      data: { projectId, name: "Old Name" },
    });

    const res = await request(app)
      .put(`/api/inventory/towers/${tower.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("New Name");
  });

  it("deletes tower (inventory.delete)", async () => {
    const { token } = await createAuthContext(["inventory.delete"]);

    const tower = await prisma.tower.create({
      data: { projectId, name: "Delete Me" },
    });

    const res = await request(app)
      .delete(`/api/inventory/towers/${tower.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const found = await prisma.tower.findUnique({
      where: { id: tower.id },
    });
    expect(found).toBeNull();
  });

  it("blocks unauthenticated access", async () => {
    const res = await request(app).get("/api/inventory/towers");
    expect(res.status).toBe(401);
  });

  it("blocks without permission", async () => {
    const { token } = await createAuthContext([]);

    const res = await request(app)
      .get("/api/inventory/towers")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
