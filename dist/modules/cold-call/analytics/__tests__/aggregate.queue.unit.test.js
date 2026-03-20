// src/modules/cold-call/analytics/__tests__/aggregate.queue.unit.test.ts
import { describe, it, expect, beforeAll, jest } from "@jest/globals";
const addMock = jest.fn();
jest.mock("bullmq", () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: addMock,
    })),
}));
describe("coldcall aggregate scheduler", () => {
    let scheduleDailyAggregate;
    beforeAll(async () => {
        const mod = await import("../scheduler/aggregate.queue.js");
        scheduleDailyAggregate = mod.scheduleDailyAggregate;
    });
    it("schedules daily aggregate job with correct cron", async () => {
        await scheduleDailyAggregate();
        expect(addMock).toHaveBeenCalledWith("daily-aggregate", {}, expect.objectContaining({
            repeat: { pattern: "5 0 * * *" },
            removeOnComplete: true,
            removeOnFail: false,
        }));
    });
});
//# sourceMappingURL=aggregate.queue.unit.test.js.map