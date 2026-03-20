// src/modules/inventory/unit/__tests__/unit.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import type { Express } from "express";

/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "@/tests/common/mocks/socket.mock.js";
import "@/tests/common/mocks/redis-lock.mock.js";
import "@/tests/common/mocks/reservation-worker.mock.js";

import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createProjectWithUnit } from "@/tests/common/factories/scenario/inventory.scenario.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Unit Routes (integration)", () => {
  let app: Express;
  let projectId: string;

  beforeEach(async () => {
    app = await createTestApp();

    // minimal setup: scenario handles correctness
    const { project } = await createProjectWithUnit();
    projectId = project.id;
  });

  it("creates unit (inventory.write)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const res = await request(app)
      .post("/api/inventory/units")
      .set("Authorization", `Bearer ${token}`)
      .send({
        projectId,
        unitNumber: "R-101",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.unitNumber).toBe("R-101");
  });

  it("lists units (inventory.read)", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    await prisma.unit.create({
      data: { projectId, unitNumber: "VISIBLE" },
    });

    const res = await request(app)
      .get("/api/inventory/units")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("sells unit (inventory.manage)", async () => {
    const { token } = await createAuthContext(["inventory.manage"]);

    const unit = await prisma.unit.create({
      data: { projectId, unitNumber: "SELL-ROUTE" },
    });

    const res = await request(app)
      .post(`/api/inventory/units/${unit.id}/sell`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 999 });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("SOLD");
  });

  it("blocks unauthenticated access", async () => {
    const res = await request(app).get("/api/inventory/units");
    expect(res.status).toBe(401);
  });

  it("blocks without permission", async () => {
    const { token } = await createAuthContext([]);
    const res = await request(app)
      .get("/api/inventory/units")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
