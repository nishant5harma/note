import { Queue } from "bullmq";
export declare const coldCallAggregateQueue: Queue<any, any, string, any, any, string>;
/**
 * Schedule the daily aggregation job.
 * Run this file once on API server startup to ensure the repeating job is registered.
 */
export declare function scheduleDailyAggregate(): Promise<void>;
//# sourceMappingURL=aggregate.queue.d.ts.map