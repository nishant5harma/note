import { Queue } from "bullmq";
export declare const coldCallRetryQueue: Queue<any, any, string, any, any, string>;
export declare function scheduleRetry(entryId: string, retryAt: Date): Promise<void>;
//# sourceMappingURL=retry.queue.d.ts.map