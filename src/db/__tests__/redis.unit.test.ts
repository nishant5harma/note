// src/db/__tests__/redis.unit.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Mock ioredis with BOTH default and named exports
jest.unstable_mockModule("ioredis", async () => {
  // @ts-ignore
  const { default: RedisMock } = await import("ioredis-mock");
  return {
    // Provide both the default and the named export to satisfy ESM imports
    default: RedisMock,
    Redis: RedisMock,
    __esModule: true,
  };
});

// 2. Dynamic import the utilities AFTER the mock is registered
const { getRedisClient, setWithTTL, getJSON } = await import("@/db/redis.js");

describe("Redis Database Utilities", () => {
  const testKey = "user:123";
  const testData = { id: 123, name: "Gemini", role: "AI" };

  beforeEach(async () => {
    const client = getRedisClient();
    await client.flushall();
    jest.clearAllMocks();
  });

  describe("getRedisClient", () => {
    it("should return the same singleton instance on multiple calls", () => {
      const client1 = getRedisClient();
      const client2 = getRedisClient();
      expect(client1).toBe(client2);
    });
  });

  describe("setWithTTL", () => {
    it("should successfully store an object as a JSON string", async () => {
      await setWithTTL(testKey, testData, 10);

      const client = getRedisClient();
      const rawValue = await client.get(testKey);

      expect(JSON.parse(rawValue!)).toEqual(testData);
    });

    it("should use the default TTL of 60 seconds if not provided", async () => {
      await setWithTTL(testKey, testData);
      const client = getRedisClient();
      const ttl = await client.ttl(testKey);

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    it("should throw an error if stringification fails", async () => {
      const circular: any = {};
      circular.self = circular;

      await expect(setWithTTL("fail-key", circular)).rejects.toThrow();
    });
  });

  describe("getJSON", () => {
    it("should retrieve and parse stored JSON data", async () => {
      await setWithTTL(testKey, testData);

      const result = await getJSON(testKey);
      expect(result).toEqual(testData);
    });

    it("should return null if the key does not exist", async () => {
      const result = await getJSON("non-existent-key");
      expect(result).toBeNull();
    });

    it("should delete the key after retrieval if 'remove' is true", async () => {
      await setWithTTL(testKey, testData);

      const result = await getJSON(testKey, true);
      expect(result).toEqual(testData);

      const checkAgain = await getJSON(testKey);
      expect(checkAgain).toBeNull();
    });

    it("should throw if the stored data is not valid JSON", async () => {
      const client = getRedisClient();
      await client.set("bad-json", "not-json-at-all");

      await expect(getJSON("bad-json")).rejects.toThrow(SyntaxError);
    });
  });
});
