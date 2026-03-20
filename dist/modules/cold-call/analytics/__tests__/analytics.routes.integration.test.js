// src/modules/cold-call/analytics/__tests__/analytics.routes.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "../../../../db/db.js";
import { userFactory, teamFactory } from "../../../../tests/common/factories/index.js";
import { subDays } from "date-fns";
describe("ColdCall Analytics Routes", () => {
    it("returns agent performance", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.read"]);
        const user = await userFactory.create();
        await prisma.coldCallAggregate.create({
            data: {
                key: "agent:test",
                kind: "agent",
                entityId: user.id,
                date: subDays(new Date(), 1),
                attempts: 10,
                connects: 4,
                conversions: 2,
            },
        });
        const res = await request(app)
            .get(`/api/coldcall/analytics/agents/${user.id}`)
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.totals.attempts).toBe(10);
        expect(res.body.data.conversionRate).toBeCloseTo(0.2);
    });
    it("returns team performance", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.read"]);
        const team = await teamFactory.create();
        await prisma.coldCallAggregate.create({
            data: {
                key: "team:test",
                kind: "team",
                entityId: team.id,
                date: subDays(new Date(), 1),
                attempts: 20,
                connects: 6,
                conversions: 3,
            },
        });
        const res = await request(app)
            .get(`/api/coldcall/analytics/teams/${team.id}`)
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.totals.attempts).toBe(20);
    });
    it("returns leaderboard", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.read"]);
        const user = await userFactory.create();
        await prisma.coldCallAggregate.create({
            data: {
                key: "agent:lb",
                kind: "agent",
                entityId: user.id,
                date: subDays(new Date(), 1),
                attempts: 5,
                connects: 3,
                conversions: 2,
            },
        });
        const res = await request(app)
            .get("/api/coldcall/analytics/leaderboard?top=5")
            .set("Authorization", `Bearer ${auth.token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].user.id).toBe(user.id);
    });
});
//# sourceMappingURL=analytics.routes.integration.test.js.map