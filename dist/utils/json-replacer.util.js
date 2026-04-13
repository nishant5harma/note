/** For Express `app.set("json replacer", …)` — Prisma BigInt fields are not JSON-serializable by default. */
export function bigintJsonReplacer(_key, value) {
    return typeof value === "bigint" ? value.toString() : value;
}
//# sourceMappingURL=json-replacer.util.js.map