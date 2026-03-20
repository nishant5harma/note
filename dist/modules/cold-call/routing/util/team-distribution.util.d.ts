/**
 * Utility: returns a picker that uses Redis atomic pointer for a given key and a sequence array.
 * sequence: precomputed team sequence (expanded for weights)
 *
 * Example usage:
 * const picker = persistentPicker("coldcall:rr:batch:123", ["A","A","B"])
 * const t = await picker(); // returns next teamId (string)
 */
export declare function persistentPicker(poolKey: string, sequence: string[]): () => Promise<string>;
/**
 * Expand weights map into a sequence
 * weights = { teamA: 2, teamB: 1 }
 */
export declare function expandSequence(teamIds: string[], weights: Record<string, number> | undefined): string[];
//# sourceMappingURL=team-distribution.util.d.ts.map