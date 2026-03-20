import { z } from "zod";
function optionalNumberFromQuery() {
    return z.preprocess((v) => {
        if (v === undefined || v === null || v === "")
            return undefined;
        // Express query can be string | string[]
        if (Array.isArray(v))
            v = v[0];
        const n = Number(v);
        return Number.isFinite(n) ? n : v;
    }, z.number().optional());
}
export const listLeadsQuerySchema = z.object({
    page: optionalNumberFromQuery().pipe(z.number().int().min(1)).optional().default(1),
    limit: optionalNumberFromQuery()
        .pipe(z.number().int().min(1).max(100))
        .optional()
        .default(50),
    q: z.string().trim().min(1).optional(), // name/email/phone contains
    source: z.string().trim().min(1).optional(),
    status: z.string().trim().min(1).optional(),
    stage: z.string().trim().min(1).optional(),
    priority: z.string().trim().min(1).optional(),
    assignedToId: z.string().trim().min(1).optional(),
    assignedTeamId: z.string().trim().min(1).optional(),
    from: z.string().trim().min(1).optional(), // ISO date string
    to: z.string().trim().min(1).optional(), // ISO date string
});
//# sourceMappingURL=lead.validator.js.map