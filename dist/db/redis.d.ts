import type { Redis as RedisType } from "ioredis";
/**
 * @function getRedisClient
 * @description Retrieves or creates a singleton Redis client instance.
 * Ensures the connection is only initialized once and includes error handling.
 * @returns {RedisType} The connected ioredis client instance.
 */
export declare function getRedisClient(): RedisType;
/**
 * @function setWithTTL
 * @description Stores a JavaScript object (value) under a specific key,
 * automatically converting it to a JSON string and setting an expiration time (TTL).
 * @param {string} key The Redis key to store the data under.
 * @param {any} value The data to be stored (will be stringified).
 * @param {number} [ttlSeconds=60] The time-to-live in seconds before the key expires.
 * @returns {Promise<void>}
 */
export declare function setWithTTL(key: string, value: any, ttlSeconds?: number): Promise<void>;
/**
 * @function getJSON
 * @description Retrieves a value stored under a key, parses it from JSON,
 * and optionally deletes the key after retrieval (get-and-remove pattern).
 * @param {string} key The Redis key to retrieve the data from.
 * @param {boolean} [remove=false] If true, the key will be deleted after reading.
 * @returns {Promise<any>} The parsed JavaScript object, or null if the key doesn't exist.
 */
export declare function getJSON(key: string, remove?: boolean): Promise<any>;
//# sourceMappingURL=redis.d.ts.map