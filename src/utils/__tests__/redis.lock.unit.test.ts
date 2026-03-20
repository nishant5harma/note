// src/utils/__tests__/redis.lock.unit.test.ts
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Mock crypto.randomUUID BEFORE importing anything else
const mockRandomUUID = jest.fn<() => string>();
jest.unstable_mockModule("crypto", () => ({
  default: {
    randomUUID: mockRandomUUID,
  },
  randomUUID: mockRandomUUID,
}));

// 2. Define the Redis client mock object
const mockRedisClient = {
  set: jest.fn<any>(),
  get: jest.fn<any>(),
  del: jest.fn<any>(),
  eval: jest.fn<any>(),
  incr: jest.fn<any>(),
  decr: jest.fn<any>(),
  pexpire: jest.fn<any>(),
  on: jest.fn<any>(),
};

// 3. Mock the getRedisClient getter from the DB module
jest.unstable_mockModule("@/db/redis.js", () => ({
  getRedisClient: jest.fn(() => mockRedisClient),
}));

// 4. Import the module under test AFTER setting up the ESM mocks
const {
  tryAcquireLock,
  releaseLock,
  leadStatusLockKey,
  claimCapacityForUser,
  releaseCapacityClaim,
} = await import("../redis.lock.js");

describe("Redis Lock Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("tryAcquireLock", () => {
    it("should successfully acquire a lock when available", async () => {
      const mockToken = "550e8400-e29b-41d4-a716-446655440000";
      mockRandomUUID.mockReturnValue(mockToken);
      mockRedisClient.set.mockResolvedValue("OK");

      const result = await tryAcquireLock("test-key", 5000);

      expect(result.acquiredLock).toBe(true);
      expect(result.token).toBe(mockToken);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "test-key",
        mockToken,
        "PX",
        5000,
        "NX"
      );
    });

    it("should fail to acquire lock when already taken", async () => {
      const mockToken = "660e8400-e29b-41d4-a716-446655440001";
      mockRandomUUID.mockReturnValue(mockToken);
      mockRedisClient.set.mockResolvedValue(null);

      const result = await tryAcquireLock("test-key", 5000);

      expect(result.acquiredLock).toBe(false);
      expect(result.token).toBe(null);
    });

    it("should use default TTL of 20000ms when not specified", async () => {
      const mockToken = "770e8400-e29b-41d4-a716-446655440002";
      mockRandomUUID.mockReturnValue(mockToken);
      mockRedisClient.set.mockResolvedValue("OK");

      await tryAcquireLock("test-key");

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "test-key",
        mockToken,
        "PX",
        20000,
        "NX"
      );
    });

    it("should generate unique tokens for each lock attempt", async () => {
      const token1 = "880e8400-e29b-41d4-a716-446655440003";
      const token2 = "990e8400-e29b-41d4-a716-446655440004";
      mockRandomUUID.mockReturnValueOnce(token1).mockReturnValueOnce(token2);
      mockRedisClient.set.mockResolvedValue("OK");

      const result1 = await tryAcquireLock("key1");
      const result2 = await tryAcquireLock("key2");

      expect(result1.token).toBe(token1);
      expect(result2.token).toBe(token2);
      expect(result1.token).not.toBe(result2.token);
    });
  });

  describe("releaseLock", () => {
    it("should successfully release lock with matching token", async () => {
      mockRedisClient.eval.mockResolvedValue(1);

      const result = await releaseLock("test-key", "valid-token");

      expect(result).toBe(true);
      expect(mockRedisClient.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call"),
        1,
        "test-key",
        "valid-token"
      );
    });

    it("should fail to release lock with mismatched token", async () => {
      mockRedisClient.eval.mockResolvedValue(0);

      const result = await releaseLock("test-key", "wrong-token");

      expect(result).toBe(false);
    });

    it("should handle eval errors gracefully", async () => {
      mockRedisClient.eval.mockRejectedValue(new Error("Redis error"));

      const result = await releaseLock("test-key", "some-token");

      expect(result).toBe(false);
    });

    it("should return false when eval throws", async () => {
      mockRedisClient.eval.mockRejectedValue(new Error("Connection lost"));

      const result = await releaseLock("test-key", "token");

      expect(result).toBe(false);
      expect(mockRedisClient.eval).toHaveBeenCalled();
    });
  });

  describe("leadStatusLockKey", () => {
    it("should generate correct lock key for string lead ID", () => {
      const key = leadStatusLockKey("lead-abc-123");
      expect(key).toBe("lock:lead-status:lead-abc-123");
    });

    it("should generate correct lock key for numeric lead ID", () => {
      const key = leadStatusLockKey(12345);
      expect(key).toBe("lock:lead-status:12345");
    });

    it("should handle zero as lead ID", () => {
      const key = leadStatusLockKey(0);
      expect(key).toBe("lock:lead-status:0");
    });
  });

  describe("claimCapacityForUser (deprecated)", () => {
    it("should increment claim counter for new user", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.pexpire.mockResolvedValue(1);

      const result = await claimCapacityForUser("user-123", 30000);

      expect(result).toBe(true);
      expect(mockRedisClient.incr).toHaveBeenCalledWith(
        "lead:capacity:claims:user-123"
      );
      expect(mockRedisClient.pexpire).toHaveBeenCalledWith(
        "lead:capacity:claims:user-123",
        30000
      );
    });

    it("should increment existing claim without resetting TTL", async () => {
      mockRedisClient.incr.mockResolvedValue(2);

      const result = await claimCapacityForUser("user-456");

      expect(result).toBe(true);
      expect(mockRedisClient.incr).toHaveBeenCalled();
      expect(mockRedisClient.pexpire).not.toHaveBeenCalled();
    });

    it("should use default TTL of 60000ms when not specified", async () => {
      mockRedisClient.incr.mockResolvedValue(1);
      mockRedisClient.pexpire.mockResolvedValue(1);

      await claimCapacityForUser("user-789");

      expect(mockRedisClient.pexpire).toHaveBeenCalledWith(
        "lead:capacity:claims:user-789",
        60000
      );
    });

    it("should always return true regardless of count", async () => {
      mockRedisClient.incr.mockResolvedValue(100);

      const result = await claimCapacityForUser("user-999");

      expect(result).toBe(true);
    });
  });

  describe("releaseCapacityClaim (deprecated)", () => {
    it("should decrement claim counter", async () => {
      mockRedisClient.decr.mockResolvedValue(2);

      await releaseCapacityClaim("user-123");

      expect(mockRedisClient.decr).toHaveBeenCalledWith(
        "lead:capacity:claims:user-123"
      );
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it("should delete key when counter reaches zero", async () => {
      mockRedisClient.decr.mockResolvedValue(0);
      mockRedisClient.del.mockResolvedValue(1);

      await releaseCapacityClaim("user-456");

      expect(mockRedisClient.decr).toHaveBeenCalled();
      expect(mockRedisClient.del).toHaveBeenCalledWith(
        "lead:capacity:claims:user-456"
      );
    });

    it("should delete key when counter goes negative", async () => {
      mockRedisClient.decr.mockResolvedValue(-1);
      mockRedisClient.del.mockResolvedValue(1);

      await releaseCapacityClaim("user-789");

      expect(mockRedisClient.del).toHaveBeenCalled();
    });

    it("should ignore errors gracefully", async () => {
      mockRedisClient.decr.mockRejectedValue(new Error("Redis error"));

      await expect(releaseCapacityClaim("user-error")).resolves.toBeUndefined();
    });

    it("should not throw when del operation fails", async () => {
      mockRedisClient.decr.mockResolvedValue(0);
      mockRedisClient.del.mockRejectedValue(new Error("Del failed"));

      await expect(releaseCapacityClaim("user-fail")).resolves.toBeUndefined();
    });
  });
});
