// src/modules/inventory/images/__tests__/image.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { prisma } from "@/db/db.js";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import type { Express } from "express";

/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */

import "@/tests/common/mocks/socket.mock.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";

await jest.unstable_mockModule("@/middlewares/upload.middleware.js", () => ({
  uploadMulti: () => {
    return (req: any, _res: any, next: any) => {
      req.fileUrls = [
        { url: "img1.jpg", storageKey: "k1" },
        { url: "img2.jpg", storageKey: "k2" },
      ];
      next();
    };
  },
}));

await jest.unstable_mockModule(
  "@/modules/socket/util-socket/push.sender.js",
  () => ({
    __esModule: true,
    sendPushToUser: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    sendLocationFetchSignal: jest
      .fn<() => Promise<boolean>>()
      .mockResolvedValue(true),
  })
);

describe("Inventory Image Routes (integration)", () => {
  let app: Express;

  beforeEach(async () => {
    app = await createTestApp();
  });

  it("uploads images to listing", async () => {
    const { token } = await createAuthContext(["inventory.write"]);

    const listing = await prisma.listing.create({
      data: {
        title: "Route Listing",
        type: "SALE",
      },
    });

    const res = await request(app)
      .post(`/api/inventory/listings/${listing.id}/images`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it("lists listing images (authenticated)", async () => {
    const { token } = await createAuthContext(["inventory.read"]);

    const listing = await prisma.listing.create({
      data: {
        title: "List Images",
        type: "SALE",
      },
    });

    await prisma.listingImage.createMany({
      data: [
        { listingId: listing.id, url: "a.jpg", meta: { position: 0 } },
        { listingId: listing.id, url: "b.jpg", meta: { position: 1 } },
      ],
    });

    const res = await request(app)
      .get(`/api/inventory/listings/${listing.id}/images`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
  });

  it("blocks unauthenticated upload", async () => {
    const listing = await prisma.listing.create({
      data: {
        title: "Blocked",
        type: "SALE",
      },
    });

    const res = await request(app).post(
      `/api/inventory/listings/${listing.id}/images`
    );

    expect(res.status).toBe(401);
  });
});
