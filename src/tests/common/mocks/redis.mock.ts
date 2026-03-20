// src/tests/common/mocks/redis.mock.ts
import { jest } from "@jest/globals";

// 1. Define a plain interface for the mock.
// This prevents TS from trying to reach into pnpm's deep node_modules for Jest types.
interface RedisMock {
  set: any;
  get: any;
  del: any;
  eval: any;
  incr: any;
  decr: any;
  pexpire: any;
  on: any;
  quit: any;
  disconnect: any;
  flushdb: any;
}

// 2. Explicitly type the constant using the interface above.
export const mockRedisClient: RedisMock = {
  set: jest.fn<any>().mockResolvedValue("OK"),
  get: jest.fn<any>().mockResolvedValue(null),
  del: jest.fn<any>().mockResolvedValue(1),
  eval: jest.fn<any>().mockResolvedValue(1),
  incr: jest.fn<any>().mockResolvedValue(1),
  decr: jest.fn<any>().mockResolvedValue(0),
  pexpire: jest.fn<any>().mockResolvedValue(1),
  on: jest.fn<any>(),
  quit: jest.fn<any>(async () => {}),
  disconnect: jest.fn<any>(),
  flushdb: jest.fn<any>().mockResolvedValue("OK"),
};

jest.mock("@/db/redis.js", () => ({
  getRedisClient: () => mockRedisClient,
}));
