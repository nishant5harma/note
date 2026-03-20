// tests/common/mocks/redis-lock.mock.ts
import { jest } from "@jest/globals";

/* ------------------------------------------- */
/* Plain interfaces (NO jest types exposed)    */
/* ------------------------------------------- */
interface TryAcquireLockFn {
  (
    key?: string,
    ttl?: number
  ): Promise<{
    acquiredLock: boolean;
    token: string;
  }>;
}

interface ReleaseLockFn {
  (key?: string, token?: string): Promise<boolean | void>;
}

/* ------------------------------------------- */
/* Explicitly typed mocks                       */
/* ------------------------------------------- */
export const tryAcquireLock: TryAcquireLockFn = jest.fn(async () => ({
  acquiredLock: true,
  token: "lock-token",
}));

export const releaseLock: ReleaseLockFn = jest.fn(async () => true);

/* ------------------------------------------- */
/* Module mock                                 */
/* ------------------------------------------- */
jest.unstable_mockModule("@/utils/redis.lock.js", () => ({
  __esModule: true,
  tryAcquireLock,
  releaseLock,
  leadStatusLockKey: (id: string) => `lock:${id}`,
}));
