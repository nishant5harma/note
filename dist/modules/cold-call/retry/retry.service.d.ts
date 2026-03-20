export declare function evaluateRetry(entryId: string): Promise<{
    shouldRetry: boolean;
    retryAt?: undefined;
} | {
    shouldRetry: boolean;
    retryAt: Date;
}>;
//# sourceMappingURL=retry.service.d.ts.map