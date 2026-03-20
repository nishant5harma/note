// src/modules/cold-call/routing/__tests__/distribute.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { distributeColdCallBatchService } from "../distribute.service.js";
import { teamFactory } from "../../../../tests/common/factories/team.factory.js";
import { userFactory } from "../../../../tests/common/factories/user.factory.js";
describe("distributeColdCallBatchService", () => {
    it("throws when batch does not exist", async () => {
        await expect(distributeColdCallBatchService("missing")).rejects.toThrow("Batch not found");
    });
    it("dryRun does not assign teams", async () => {
        const user = await userFactory.create();
        const team = await teamFactory.create();
        const batch = await prisma.coldCallBatch.create({
            data: {
                uploadedById: user.id,
                routingConfig: {
                    rules: [
                        {
                            kind: "default",
                            config: { teamIds: [team.id] },
                        },
                    ],
                },
            },
        });
        await prisma.coldCallEntry.create({
            data: { batchId: batch.id, rowIndex: 1 },
        });
        const res = await distributeColdCallBatchService(batch.id, {
            dryRun: true,
        });
        expect(res.assignedCount).toBe(1);
        const entry = await prisma.coldCallEntry.findFirst({
            where: { batchId: batch.id },
        });
        expect(entry?.assignedTeamId).toBeNull();
    });
});
//# sourceMappingURL=distribute.service.integration.test.js.map