// /src/modules/cold-call/report/team-report/team-report.service.ts
import { prisma } from "../../../../db/db.js";
export async function getColdCallTeamReport(batchId) {
    const where = {};
    if (batchId)
        where.batchId = batchId;
    // Find all teams used in assignments
    const teams = await prisma.coldCallEntry.groupBy({
        by: ["assignedTeamId"],
        where,
        _count: { _all: true },
    });
    const results = [];
    for (const t of teams) {
        if (!t.assignedTeamId)
            continue;
        const teamId = t.assignedTeamId;
        const statusCounts = await prisma.coldCallEntry.groupBy({
            by: ["status"],
            where: { ...where, assignedTeamId: teamId },
            _count: { _all: true },
        });
        const counts = {
            pending: 0,
            in_progress: 0,
            done: 0,
            skipped_duplicate: 0,
        };
        for (const s of statusCounts) {
            counts[s.status] = s._count._all;
        }
        const attempts = await prisma.coldCallAttempt.count({
            where: {
                entry: { assignedTeamId: teamId },
            },
        });
        const interested = await prisma.coldCallEntry.count({
            where: {
                assignedTeamId: teamId,
                response: "interested",
            },
        });
        results.push({
            teamId,
            totals: t._count._all,
            ...counts,
            attempts,
            interested,
            successRate: t._count._all > 0 ? (interested / t._count._all).toFixed(2) : "0.00",
        });
    }
    return results;
}
//# sourceMappingURL=team-report.service.js.map