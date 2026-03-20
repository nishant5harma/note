import { Worker } from "bullmq";
export declare function runRetry(entryId: string): Promise<void>;
declare let coldCallRetryWorker: Worker | null;
export { coldCallRetryWorker };
//# sourceMappingURL=retry.worker.d.ts.map