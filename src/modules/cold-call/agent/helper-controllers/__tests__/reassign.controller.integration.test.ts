// src/modules/cold-call/agent/helper-controllers/reassign.controller.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "@/db/db.js";
import { userFactory } from "@/tests/common/factories/user.factory.js";

describe("POST /api/coldcall/pull/entries/:id/reassign", () => {
  it("reassigns entry and writes assignment history", async () => {
    const app = await createTestApp();
    const admin = await createAuthContext(["coldcall.assign"]);
    const target = await userFactory.create();

    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        status: "in_progress",
        lockUserId: admin.user.id,
      },
    });

    const res = await request(app)
      .post(`/api/coldcall/pull/entries/${entry.id}/reassign`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ toUserId: target.id, reason: "Load balance" });

    expect(res.status).toBe(200);

    const history = await prisma.coldCallAssignmentHistory.findMany({
      where: { entryId: entry.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0]!.toUserId).toBe(target.id);
  });
});
