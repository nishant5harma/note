// /src/tests/common/helpers/redis-bull-helper.ts
import { getRedisClient } from "../../../db/redis.js";
export async function flushAllRedisAndQueues() {
    const client = getRedisClient();
    try {
        // For test isolation, flush selected DB only
        // If REDIS_URL includes db index, flushdb will clear it
        await client.flushdb();
    }
    catch (err) {
        console.warn("Redis flush failed", err);
    }
}
//# sourceMappingURL=redis-bull-helper.js.map