/** For Express `app.set("json replacer", …)` — Prisma BigInt fields are not JSON-serializable by default. */
export function bigintJsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}
