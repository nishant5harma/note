// src/modules/cold-call/report/__tests__/agent-report.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "@/tests/common/helpers/create-test-app.js";
import { createAuthContext } from "@/tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "@/db/db.js";
import {
  userFactory,
  teamFactory,
  teamMemberFactory,
} from "@/tests/common/factories/index.js";

describe("GET /api/coldcall/report/agents", () => {
  it("returns agent performance metrics", async () => {
    const app = await createTestApp();
    const auth = await createAuthContext(["coldcall.read"]);

    const team = await teamFactory.create();
    const agent = await userFactory.create();

    await teamMemberFactory.create({
      teamId: team.id!,
      userId: agent.id!,
    });

    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        assignedTeamId: team.id!,
        lockUserId: agent.id!,
        status: "done",
        response: "interested",
      },
    });

    await prisma.coldCallAttempt.create({
      data: {
        entryId: entry.id,
        userId: agent.id!,
        result: "interested",
      },
    });

    const res = await request(app)
      .get("/api/coldcall/report/agents")
      .set("Authorization", `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    const row = res.body.data[0];
    expect(row.userId).toBe(agent.id);
    expect(row.done).toBe(1);
    expect(row.attempts).toBe(1);
    expect(row.interested).toBe(1);
    expect(row.successRate).toBe("1.00");
    expect(row.avgAttempts).toBe("1.00");
  });
});
