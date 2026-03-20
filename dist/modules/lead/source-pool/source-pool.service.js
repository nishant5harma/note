import { prisma } from "../../../db/db.js";
export async function listSourcePools(opts) {
    const where = {};
    if (typeof opts.active === "boolean")
        where.active = opts.active;
    const rows = await prisma.sourcePool.findMany({
        where,
        orderBy: [{ source: "asc" }],
        include: { team: true },
    });
    return rows;
}
export async function upsertSourcePool(input) {
    return prisma.sourcePool.upsert({
        where: { source: input.source },
        update: {
            ...(input.teamId !== undefined ? { teamId: input.teamId } : {}),
            ...(input.strategy !== undefined ? { strategy: input.strategy } : {}),
            ...(input.active !== undefined ? { active: input.active } : {}),
            ...(input.meta !== undefined ? { meta: input.meta } : {}),
        },
        create: {
            source: input.source,
            teamId: input.teamId ?? null,
            strategy: input.strategy ?? null,
            active: input.active ?? true,
            meta: input.meta ?? undefined,
        },
        include: { team: true },
    });
}
export async function updateSourcePoolBySource(source, patch) {
    return prisma.sourcePool.update({
        where: { source },
        data: {
            ...(patch.teamId !== undefined ? { teamId: patch.teamId } : {}),
            ...(patch.strategy !== undefined ? { strategy: patch.strategy } : {}),
            ...(patch.active !== undefined ? { active: patch.active } : {}),
            ...(patch.meta !== undefined ? { meta: patch.meta } : {}),
        },
        include: { team: true },
    });
}
export async function deleteSourcePoolBySource(source) {
    return prisma.sourcePool.delete({ where: { source } });
}
/**
 * Returns distinct lead sources that are present in DB but missing an active SourcePool mapping
 * OR mapped but teamId is null.
 */
export async function listUnmappedLeadSources() {
    const sources = await prisma.lead.findMany({
        where: { source: { not: null } },
        distinct: ["source"],
        select: { source: true },
    });
    const rows = await prisma.sourcePool.findMany({
        where: { active: true },
        select: { source: true, teamId: true },
    });
    const mapped = new Map(rows.map((r) => [r.source, r.teamId]));
    const unmapped = sources
        .map((s) => (s.source ? String(s.source).trim().toLowerCase() : null))
        .filter((s) => !!s)
        .filter((s) => !mapped.has(s) || mapped.get(s) == null)
        .sort((a, b) => a.localeCompare(b));
    return unmapped;
}
//# sourceMappingURL=source-pool.service.js.map