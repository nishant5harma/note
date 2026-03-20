// src/modules/cold-call/report/__tests__/batch-summary.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "@/db/db.js";

describe("GET /api/coldcall/report/batches/:id/summary", () => {
  it("returns batch summary and progress", async () => {
    const app = await createTestApp();
    const auth = await createAuthContext(["coldcall.read"]);

    const batch = await prisma.coldCallBatch.create({
      data: { totalCount: 3 },
    });

    await prisma.coldCallEntry.createMany({
      data: [
        { batchId: batch.id, status: "done" },
        { batchId: batch.id, status: "pending" },
        { batchId: batch.id, status: "skipped_duplicate" },
      ],
    });

    const res = await request(app)
      .get(`/api/coldcall/report/batches/${batch.id}/summary`)
      .set("Authorization", `Bearer ${auth.token}`);

    expect(res.status).toBe(200);

    const data = res.body.data;
    expect(data.statusCounts.done).toBe(1);
    expect(data.statusCounts.pending).toBe(1);
    expect(data.statusCounts.skipped_duplicate).toBe(1);
    expect(data.progress.total).toBe(3);
  });
});
