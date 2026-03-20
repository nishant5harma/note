// src/modules/cold-call/agent/__tests__/pull.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "@/db/db.js";
import { refreshLock, releaseLock } from "../pull.service.js";
import { userFactory } from "@/tests/common/factories/user.factory.js";

describe("pull.service – integration", () => {
  it("allows lock refresh by owner", async () => {
    const user = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        lockUserId: user.id!,
        lockExpiresAt: new Date(Date.now() + 1000),
        status: "in_progress",
      },
    });

    const updated = await refreshLock(entry.id, user.id!);

    expect(updated.lockExpiresAt!.getTime()).toBeGreaterThan(Date.now());
    expect(updated.status).toBe("in_progress");
  });

  it("prevents lock refresh by non-owner", async () => {
    const owner = await userFactory.create();
    const intruder = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        lockUserId: owner.id!,
        lockExpiresAt: new Date(Date.now() + 1000),
        status: "in_progress",
      },
    });

    await expect(refreshLock(entry.id, intruder.id!)).rejects.toThrow(
      "not-lock-owner"
    );
  });

  it("allows owner to release lock and reset status", async () => {
    const user = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        lockUserId: user.id!,
        status: "in_progress",
      },
    });

    const updated = await releaseLock(entry.id, user.id!, true);

    expect(updated.lockUserId).toBeNull();
    expect(updated.status).toBe("pending");
  });

  it("prevents non-owner from releasing active lock", async () => {
    const owner = await userFactory.create();
    const intruder = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        lockUserId: owner.id!,
        lockExpiresAt: new Date(Date.now() + 60_000),
        status: "in_progress",
      },
    });

    await expect(releaseLock(entry.id, intruder.id!, true)).rejects.toThrow(
      "cannot-release-lock"
    );
  });

  it("allows releasing expired lock by another user", async () => {
    const owner = await userFactory.create();
    const other = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        lockUserId: owner.id!,
        lockExpiresAt: new Date(Date.now() - 1000),
        status: "in_progress",
      },
    });

    const updated = await releaseLock(entry.id, other.id!, true);

    expect(updated.lockUserId).toBeNull();
    expect(updated.status).toBe("pending");
  });
});
