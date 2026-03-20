// src/modules/cold-call/agent/util/__tests__/auto-unlock.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../../../db/db.js";
import { autoUnlockExpiredColdCallEntries } from "../auto-unlock.util.js";
import { userFactory } from "../../../../../tests/common/factories/user.factory.js";
describe("autoUnlockExpiredColdCallEntries", () => {
    it("releases expired locked entries", async () => {
        const batch = await prisma.coldCallBatch.create({ data: {} });
        const user = await userFactory.create();
        const created = await prisma.coldCallEntry.create({
            data: {
                batchId: batch.id,
                status: "in_progress",
                lockUserId: user.id,
                lockExpiresAt: new Date(Date.now() - 60_000),
            },
        });
        const count = await autoUnlockExpiredColdCallEntries();
        expect(count).toBe(1);
        // ✅ fetch the SAME entry
        const entry = await prisma.coldCallEntry.findUnique({
            where: { id: created.id },
        });
        expect(entry.status).toBe("pending");
        expect(entry.lockUserId).toBeNull();
        expect(entry.lockExpiresAt).toBeNull();
    });
});
//# sourceMappingURL=auto-unlock.util.unit.test.js.map