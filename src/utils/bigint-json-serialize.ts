/**
 * Prisma returns JS `bigint` for DB BigInt columns; `JSON.stringify` throws on them by default.
 * Install once at process startup so HTTP, Redis, and other callers can serialize safely.
 */
const proto = BigInt.prototype as unknown as { toJSON?: () => string };
if (proto.toJSON === undefined) {
  proto.toJSON = function toJSON(this: bigint): string {
    return this.toString();
  };
}
