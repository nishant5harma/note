// src/modules/cold-call/agent/helper-controllers/attempt.controller.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createTestApp } from "../../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../../tests/common/helpers/auth-scenario.helper.js";
import { prisma } from "../../../../../db/db.js";
describe("POST /api/coldcall/pull/entries/:id/attempt", () => {
    it("logs an attempt and increments attemptNo", async () => {
        const app = await createTestApp();
        const auth = await createAuthContext(["coldcall.call"]);
        const batch = await prisma.coldCallBatch.create({ data: {} });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                status: "pending",
            },
        });
        const res = await request(app)
            .post(`/api/coldcall/pull/entries/${entry.id}/attempt`)
            .set("Authorization", `Bearer ${auth.token}`)
            .send({ result: "busy", notes: "No pickup" });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        const attempts = await prisma.coldCallAttempt.findMany({
            where: { entryId: entry.id },
        });
        expect(attempts).toHaveLength(1);
        expect(attempts[0].attemptNo).toBe(1);
    });
});
//# sourceMappingURL=attempt.controller.integration.test.js.map