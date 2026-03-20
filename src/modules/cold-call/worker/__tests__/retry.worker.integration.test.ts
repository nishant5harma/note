// src/modules/cold-call/worker/__tests__/retry.worker.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "@/db/db.js";
import { userFactory } from "@/tests/common/factories/user.factory.js";
import { runRetry } from "../retry.worker.js";

describe("coldcall retry worker", () => {
  it("resets entry for retry", async () => {
    const user = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        status: "done",
        lockUserId: user.id!,
        response: "not_interested",
        disposition: "busy",
      },
    });

    await runRetry(entry.id);

    const updated = await prisma.coldCallEntry.findUnique({
      where: { id: entry.id },
    });

    expect(updated!.status).toBe("pending");
    expect(updated!.lockUserId).toBeNull();
    expect(updated!.response).toBeNull();
    expect(updated!.disposition).toBeNull();
  });
});
