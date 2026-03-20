// src/modules/cold-call/worker/__tests__/auto-unlock.worker.integration.test.ts
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from "@jest/globals";
import { prisma } from "@/db/db.js";
import { subMinutes } from "date-fns";
import { userFactory } from "@/tests/common/factories/user.factory.js";
import { runAutoUnlock } from "../auto-unlock.worker.js";

describe("coldcall auto-unlock worker", () => {
  beforeEach(async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("releases expired locked entries", async () => {
    const user = await userFactory.create();
    const batch = await prisma.coldCallBatch.create({ data: {} });

    const entry = await prisma.coldCallEntry.create({
      data: {
        batchId: batch.id,
        status: "in_progress",
        lockUserId: user.id!,
        lockExpiresAt: subMinutes(new Date(), 10),
      },
    });

    await runAutoUnlock();

    const updated = await prisma.coldCallEntry.findUnique({
      where: { id: entry.id },
    });

    expect(updated!.status).toBe("pending");
    expect(updated!.lockUserId).toBeNull();
    expect(updated!.lockExpiresAt).toBeNull();
  });
});
