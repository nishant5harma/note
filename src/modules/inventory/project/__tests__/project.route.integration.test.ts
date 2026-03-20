// src/modules/inventory/project/__tests__/project.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import type { Express } from "express";
/* ------------------------------------------------------------------ */
/* ✅ GLOBAL MOCKS                                                     */
/* ------------------------------------------------------------------ */
import "@/tests/common/mocks/socket.mock.js";

/* ------------------------------------------------------------------ */
/* ✅ TEST HELPERS                                                     */
/* ------------------------------------------------------------------ */
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Project Routes (integration)", () => {
  let app: Express;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it("creates project (inventory.write)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const res = await request(app)
      .post("/api/inventory/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Route Project",
        city: "Delhi",
      });

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe("Route Project");
  });

  it("lists projects (inventory.read)", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    await prisma.project.create({
      data: { name: "Visible Project" },
    });

    const res = await request(app)
      .get("/api/inventory/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("updates project (inventory.write)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const project = await prisma.project.create({
      data: { name: "Old Name" },
    });

    const res = await request(app)
      .put(`/api/inventory/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body.project.name).toBe("New Name");
  });

  it("deletes project (inventory.delete)", async () => {
    const { token } = await createAuthContext(["inventory.delete"]);

    const project = await prisma.project.create({
      data: { name: "Delete Me" },
    });

    const res = await request(app)
      .delete(`/api/inventory/projects/${project.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const found = await prisma.project.findUnique({
      where: { id: project.id },
    });

    expect(found).toBeNull();
  });

  it("blocks unauthenticated access", async () => {
    const res = await request(app).get("/api/inventory/projects");
    expect(res.status).toBe(401);
  });

  it("blocks without permission", async () => {
    const { token } = await createAuthContext([]);

    const res = await request(app)
      .get("/api/inventory/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
