// src/db/redis.ts
import { Redis } from "ioredis";
// --- Configuration ---
// Get the Redis connection URL from environment variables, defaulting to local host.
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// Holds the singleton Redis client instance to ensure only one connection is made.
let redis = null;
// --- Client Management ---
/**
 * @function getRedisClient
 * @description Retrieves or creates a singleton Redis client instance.
 * Ensures the connection is only initialized once and includes error handling.
 * @returns {RedisType} The connected ioredis client instance.
 */
export function getRedisClient() {
    // Check if the client has already been initialized.
    if (!redis) {
        // Initialize the Redis client using the configured URL.
        redis = new Redis(REDIS_URL);
        // Set up an error listener to log connection errors.
        redis.on("error", (err) => {
            console.error("Redis error:", err);
        });
    }
    // Return the single instance of the client.
    return redis;
}
// --- Data Storage Functions ---
/**
 * @function setWithTTL
 * @description Stores a JavaScript object (value) under a specific key,
 * automatically converting it to a JSON string and setting an expiration time (TTL).
 * @param {string} key The Redis key to store the data under.
 * @param {any} value The data to be stored (will be stringified).
 * @param {number} [ttlSeconds=60] The time-to-live in seconds before the key expires.
 * @returns {Promise<void>}
 */
export async function setWithTTL(key, value, ttlSeconds = 60) {
    const client = getRedisClient();
    // Convert the JavaScript object into a JSON string for storage in Redis.
    const str = JSON.stringify(value);
    // Use the Redis SET command with the 'EX' option (Expire in seconds).
    // The 'EX' option ensures the key is automatically deleted after the TTL.
    await client.set(key, str, "EX", ttlSeconds);
}
/**
 * @function getJSON
 * @description Retrieves a value stored under a key, parses it from JSON,
 * and optionally deletes the key after retrieval (get-and-remove pattern).
 * @param {string} key The Redis key to retrieve the data from.
 * @param {boolean} [remove=false] If true, the key will be deleted after reading.
 * @returns {Promise<any>} The parsed JavaScript object, or null if the key doesn't exist.
 */
export async function getJSON(key, remove = false) {
    const client = getRedisClient();
    // Use the Redis GET command to retrieve the raw string value.
    const raw = await client.get(key);
    // If the key does not exist (raw is null or undefined), return null immediately.
    if (!raw)
        return null;
    // Parse the stored JSON string back into a JavaScript object.
    const parsed = JSON.parse(raw);
    // Optional: If 'remove' is true, delete the key using the DEL command.
    if (remove)
        await client.del(key);
    return parsed;
}
//# sourceMappingURL=redis.js.map