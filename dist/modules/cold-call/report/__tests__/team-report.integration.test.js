// src/modules/cold-call/report/__tests__/team-report.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "../../../../db/db.js";
import { teamFactory } from "../../../../tests/common/factories/index.js";
describe("GET /api/coldcall/report/teams", () => {
    it("returns team-level report", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.read"]);
        const team = await teamFactory.create();
        const batch = await prisma.coldCallBatch.create({ data: {} });
        await prisma.coldCallEntry.createMany({
            data: [
                {
                    batchId: batch.id,
                    assignedTeamId: team.id,
                    status: "done",
                    response: "interested",
                },
                {
                    batchId: batch.id,
                    assignedTeamId: team.id,
                    status: "pending",
                },
            ],
        });
        const res = await request(app)
            .get("/api/coldcall/report/teams")
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        const row = res.body.data[0];
        expect(row.teamId).toBe(team.id);
        expect(row.totals).toBe(2);
        expect(row.done).toBe(1);
        expect(row.pending).toBe(1);
        expect(row.successRate).toBe("0.50");
    });
});
//# sourceMappingURL=team-report.integration.test.js.map