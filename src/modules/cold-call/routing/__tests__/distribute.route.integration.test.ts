// src/modules/cold-call/routing/__tests__/distribute.route.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { userFactory } from "@/tests/common/factories/user.factory.js";
import { prisma } from "@/db/db.js";

describe("cold-call distribution routes", () => {
  it("rejects without permission", async () => {
    const app = await createTestApp();

    await request(app).post("/api/coldcall/123/distribute").expect(401);
  });

  it("allows distribute with permission", async () => {
    const user = await userFactory.create();

    const batch = await prisma.coldCallBatch.create({
      data: {
        uploadedById: user.id!,
      },
    });

    const { token } = await createAuthContext(["coldcall.distribute"]);

    const app = await createTestApp();

    const res = await request(app)
      .post(`/api/coldcall/batches/${batch.id}/distribute`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
