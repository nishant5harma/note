// tests/common/mocks/redis-lock.mock.ts
import { jest } from "@jest/globals";
/* ------------------------------------------- */
/* Explicitly typed mocks                       */
/* ------------------------------------------- */
export const tryAcquireLock = jest.fn(async () => ({
    acquiredLock: true,
    token: "lock-token",
}));
export const releaseLock = jest.fn(async () => true);
/* ------------------------------------------- */
/* Module mock                                 */
/* ------------------------------------------- */
jest.unstable_mockModule("@/utils/redis.lock.js", () => ({
    __esModule: true,
    tryAcquireLock,
    releaseLock,
    leadStatusLockKey: (id) => `lock:${id}`,
}));
//# sourceMappingURL=redis-lock.mock.js.map