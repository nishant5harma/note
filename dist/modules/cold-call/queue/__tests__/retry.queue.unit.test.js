// src/modules/cold-call/queue/__tests__/retry.queue.unit.test.ts
import { describe, it, expect, jest } from "@jest/globals";
import { mockQueue } from "../../../../tests/common/mocks/bull.mock.js";
describe("cold-call retry queue", () => {
    it("schedules a retry job with correct delay and options", async () => {
        // Clear BEFORE import (critical)
        mockQueue.add.mockClear();
        const now = Date.now();
        const nowSpy = jest.spyOn(Date, "now").mockReturnValue(now);
        // Dynamic import so queue instance is fresh
        const { scheduleRetry } = await import("../retry.queue.js");
        const retryAt = new Date(now + 30_000);
        await scheduleRetry("entry-123", retryAt);
        expect(mockQueue.add).toHaveBeenCalledTimes(1);
        const call = mockQueue.add.mock.calls[0];
        const [jobName, payload, options] = call;
        expect(jobName).toBe("retry-entry");
        expect(payload).toEqual({ entryId: "entry-123" });
        expect(options).toMatchObject({
            delay: 30_000,
            attempts: 1,
            removeOnComplete: true,
            removeOnFail: false,
        });
        nowSpy.mockRestore();
    });
});
//# sourceMappingURL=retry.queue.unit.test.js.map