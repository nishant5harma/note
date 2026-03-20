// src/modules/cold-call/report/__tests__/entry-list.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "@/db/db.js";

describe("GET /api/coldcall/report/entries", () => {
  it("returns paginated entries with filters", async () => {
    const app = await createTestApp();
    const auth = await createAuthContext(["coldcall.read"]);

    const batch = await prisma.coldCallBatch.create({ data: {} });

    await prisma.coldCallEntry.createMany({
      data: [
        { batchId: batch.id, status: "done" },
        { batchId: batch.id, status: "pending" },
      ],
    });

    const res = await request(app)
      .get(`/api/coldcall/report/entries?batchId=${batch.id}&limit=1`)
      .set("Authorization", `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.rows.length).toBe(1);
    expect(res.body.data.pagination.total).toBe(2);
    expect(res.body.data.pagination.pages).toBe(2);
  });
});
