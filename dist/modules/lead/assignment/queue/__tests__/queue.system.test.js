// src/modules/lead/assignment/queue/__tests__/queue.system.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { mockQueue } from "../../../../../tests/common/mocks/bull.mock.js";
import { mockRedisClient } from "../../../../../tests/common/mocks/redis.mock.js";
// Note: No more unstable_mockModule for bullmq or redis here!
// It's handled globally by the mock files.
const { enqueueAssignmentJob, enqueueAssignmentCheckJob } = await import("../queue.js");
describe("assignment queue helpers (system)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    it("returns jobId on immediate assignment", async () => {
        const id = await enqueueAssignmentJob("l1", "a1");
        expect(id).toBe("job123");
        expect(mockQueue.add).toHaveBeenCalledWith("assign-lead", expect.objectContaining({ leadId: "l1", assignmentId: "a1", attempt: 0 }), expect.objectContaining({ jobId: "assign-a1" }));
    });
    it("returns jobId on delayed assignment check", async () => {
        const id = await enqueueAssignmentCheckJob("l1", "a1");
        expect(id).toBe("job123");
    });
    it("calculates and passes the correct delayMs to BullMQ", async () => {
        const delayMs = 15000;
        await enqueueAssignmentCheckJob("lead_test_id", "assign_test_id", {
            delayMs,
        });
        expect(mockQueue.add).toHaveBeenCalledWith("assignment-check", expect.any(Object), expect.objectContaining({ delay: 15000 }));
    });
    it("defaults delay to 0 if no delay option is provided", async () => {
        await enqueueAssignmentCheckJob("l1", "a1");
        expect(mockQueue.add).toHaveBeenCalledWith("assignment-check", expect.any(Object), expect.objectContaining({ delay: 0 }));
    });
    it("includes a timestamp in the check jobId for uniqueness", async () => {
        const assignmentId = "a1";
        const mockTime = 1700000000000;
        jest.spyOn(Date, "now").mockReturnValue(mockTime);
        await enqueueAssignmentCheckJob("l1", assignmentId);
        expect(mockQueue.add).toHaveBeenCalledWith("assignment-check", expect.any(Object), expect.objectContaining({
            jobId: `check-${assignmentId}-${mockTime}`,
        }));
    });
    it("respects BULLMQ_PREFIX for queue names", async () => {
        process.env.BULLMQ_PREFIX = "prod-v1-";
        // We still use the dynamic import for prefix testing to ensure
        // the module re-evaluates the process.env logic
        const { ASSIGNMENT_QUEUE_NAME } = await import(`../queue.js?update=${Date.now()}`);
        expect(ASSIGNMENT_QUEUE_NAME).toBe("prod-v1-assignment");
        delete process.env.BULLMQ_PREFIX;
    });
});
//# sourceMappingURL=queue.system.test.js.map