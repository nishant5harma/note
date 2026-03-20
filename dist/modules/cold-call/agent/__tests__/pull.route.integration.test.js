// src/modules/cold-call/agent/__tests__/pull.route.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "../../../../db/db.js";
import { teamFactory, teamMemberFactory, } from "../../../../tests/common/factories/index.js";
describe("POST /api/coldcall/pull", () => {
    it("pulls next available entry for agent team", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.call"]);
        const team = await teamFactory.create();
        await teamMemberFactory.create({
            userId: auth.user.id,
            teamId: team.id,
        });
        const batch = await prisma.coldCallBatch.create({ data: {} });
        await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                assignedTeamId: team.id,
                status: "pending",
            },
        });
        const res = await request(app)
            .post("/api/coldcall/pull")
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.entry).toBeTruthy();
    });
    it("returns 400 when user has no team membership", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.call"]);
        const res = await request(app)
            .post("/api/coldcall/pull")
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("no-team-membership");
    });
});
//# sourceMappingURL=pull.route.integration.test.js.map