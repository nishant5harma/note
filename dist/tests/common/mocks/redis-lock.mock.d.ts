interface TryAcquireLockFn {
    (key?: string, ttl?: number): Promise<{
        acquiredLock: boolean;
        token: string;
    }>;
}
interface ReleaseLockFn {
    (key?: string, token?: string): Promise<boolean | void>;
}
export declare const tryAcquireLock: TryAcquireLockFn;
export declare const releaseLock: ReleaseLockFn;
export {};
//# sourceMappingURL=redis-lock.mock.d.ts.map