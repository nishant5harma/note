// src/modules/cold-call/agent/helper-controllers/tasks.controller.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../../tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "../../../../../db/db.js";
import { teamFactory, teamMemberFactory, } from "../../../../../tests/common/factories/index.js";
describe("GET /api/coldcall/pull/my-tasks", () => {
    it("returns locked, pendingCount, and recentCompleted", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.call"]);
        const team = await teamFactory.create();
        await teamMemberFactory.create({
            userId: auth.user.id,
            teamId: team.id,
        });
        const batch1 = await prisma.coldCallBatch.create({ data: {} });
        const batch2 = await prisma.coldCallBatch.create({ data: {} });
        await prisma.coldCallEntry.createMany({
            data: [
                {
                    batchId: batch1.id,
                    status: "in_progress",
                    lockUserId: auth.user.id,
                },
                {
                    batchId: batch2.id,
                    status: "pending",
                    assignedTeamId: team.id,
                },
            ],
        });
        const res = await request(app)
            .get("/api/coldcall/pull/my-tasks")
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.locked.length).toBe(1);
        expect(res.body.pendingCount).toBe(1);
    });
});
//# sourceMappingURL=tasks.controller.integration.test.js.map