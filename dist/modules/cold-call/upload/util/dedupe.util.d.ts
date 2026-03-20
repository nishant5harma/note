/**
 * computeColdCallDedupeHash
 * - Normalizes phone & email and computes a sha256 hex -> truncated if needed
 * - returns null when neither phone nor email present (important)
 */
export declare function computeColdCallDedupeHash(input: {
    phone?: string | null;
    email?: string | null;
}): string | null;
//# sourceMappingURL=dedupe.util.d.ts.map