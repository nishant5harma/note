// src/modules/cold-call/analytics/__tests__/aggregate.worker.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { subDays } from "date-fns";
import { userFactory, teamFactory, leadFactory, } from "../../../../tests/common/factories/index.js";
import { runColdCallAggregation } from "../workers/aggregate.worker.js";
describe("coldcall aggregate worker", () => {
    it("aggregates agent and team metrics correctly", async () => {
        // --- Arrange ---
        const user = await userFactory.create();
        const team = await teamFactory.create();
        const lead = await leadFactory.create();
        const batch = await prisma.coldCallBatch.create({ data: {} });
        const entry = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                assignedTeamId: team.id,
                lockUserId: user.id,
                leadId: lead.id, // ✅ real FK
                status: "done",
            },
        });
        await prisma.coldCallAttempt.create({
            data: {
                entryId: entry.id,
                userId: user.id,
                result: "interested",
                createdAt: subDays(new Date(), 1), // must fall into aggregation window
            },
        });
        // --- Act ---
        await runColdCallAggregation();
        // --- Assert: Agent aggregate ---
        const agentAgg = await prisma.coldCallAggregate.findFirst({
            where: {
                kind: "agent",
                entityId: user.id,
            },
        });
        expect(agentAgg).toBeTruthy();
        expect(agentAgg.attempts).toBe(1);
        expect(agentAgg.connects).toBe(1);
        expect(agentAgg.conversions).toBe(1);
        // --- Assert: Team aggregate ---
        const teamAgg = await prisma.coldCallAggregate.findFirst({
            where: {
                kind: "team",
                entityId: team.id,
            },
        });
        expect(teamAgg).toBeTruthy();
        expect(teamAgg.attempts).toBe(1);
        expect(teamAgg.connects).toBe(1);
        expect(teamAgg.conversions).toBe(1);
    });
});
//# sourceMappingURL=aggregate.worker.integration.test.js.map