// src/modules/inventory/listing/__tests__/listing.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import type { Express } from "express";

/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "@/tests/common/mocks/socket.mock.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                            */
/* ------------------------------------------------------------------ */
describe("Inventory Listing Routes (integration)", () => {
  let app: Express;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it("creates listing (authorized)", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const res = await request(app)
      .post("/api/inventory/listings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Route Listing",
        type: "SALE",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Route Listing");
  });

  it("lists listings (read permission)", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    await prisma.listing.create({
      data: { title: "Visible", type: "SALE" },
    });

    const res = await request(app)
      .get("/api/inventory/listings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("blocks unauthenticated access", async () => {
    const res = await request(app).get("/api/inventory/listings");
    expect(res.status).toBe(401);
  });

  it("blocks access without permission", async () => {
    const { token } = await createAuthContext([]);

    const res = await request(app)
      .get("/api/inventory/listings")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("closes listing (manage permission)", async () => {
    const { token } = await createAuthContext(["inventory.manage"]);

    const listing = await prisma.listing.create({
      data: { title: "Close Route", type: "SALE" },
    });

    const res = await request(app)
      .post(`/api/inventory/listings/${listing.id}/close`)
      .set("Authorization", `Bearer ${token}`)
      .send({ note: "done" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CLOSED");
  });
});
