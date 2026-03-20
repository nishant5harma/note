// src/modules/cold-call/routing/util/__tests__/team-distribution.util.unit.test.ts
import { describe, it, expect } from "@jest/globals";
import { expandSequence, persistentPicker } from "../team-distribution.util.js";
import { mockRedisClient } from "@/tests/common/mocks/redis.mock.js";

describe("expandSequence", () => {
  it("expands weights", () => {
    const seq = expandSequence(["A", "B"], { A: 2, B: 1 });
    expect(seq).toEqual(["A", "A", "B"]);
  });
});

describe("persistentPicker", () => {
  it("returns RR picks", async () => {
    mockRedisClient.incr.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    const pick = persistentPicker("k", ["X", "Y"]);
    expect(await pick()).toBe("X");
    expect(await pick()).toBe("Y");
  });
});
