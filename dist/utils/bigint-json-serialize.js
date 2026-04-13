/**
 * Prisma returns JS `bigint` for DB BigInt columns; `JSON.stringify` throws on them by default.
 * Install once at process startup so HTTP, Redis, and other callers can serialize safely.
 */
const proto = BigInt.prototype;
if (proto.toJSON === undefined) {
    proto.toJSON = function toJSON() {
        return this.toString();
    };
}
export {};
//# sourceMappingURL=bigint-json-serialize.js.map