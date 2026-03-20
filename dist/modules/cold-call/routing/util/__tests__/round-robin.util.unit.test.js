// src/modules/cold-call/routing/util/__tests__/round-robin.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { pickWeightedRR } from "../round-robin.util.js";
import { mockRedisClient } from "../../../../../tests/common/mocks/redis.mock.js";
describe("pickWeightedRR", () => {
    it("cycles through sequence", async () => {
        mockRedisClient.incr
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2)
            .mockResolvedValueOnce(3);
        const seq = ["A", "B"];
        expect(await pickWeightedRR("k", seq)).toBe("A");
        expect(await pickWeightedRR("k", seq)).toBe("B");
        expect(await pickWeightedRR("k", seq)).toBe("A");
    });
});
//# sourceMappingURL=round-robin.util.unit.test.js.map