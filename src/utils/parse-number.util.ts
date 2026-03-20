// /src/utils/parse-number.util.ts

// Helper to safely parse a query param to number
export function parseNumber(value: unknown): number | undefined {
  if (typeof value === "string") {
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}
