// src/tests/common/mocks/redis.mock.ts
import { jest } from "@jest/globals";
// 2. Explicitly type the constant using the interface above.
export const mockRedisClient = {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    pexpire: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    quit: jest.fn(async () => { }),
    disconnect: jest.fn(),
    flushdb: jest.fn().mockResolvedValue("OK"),
};
jest.mock("@/db/redis.js", () => ({
    getRedisClient: () => mockRedisClient,
}));
//# sourceMappingURL=redis.mock.js.map