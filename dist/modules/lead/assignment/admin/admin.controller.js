import { asString } from "../../../../utils/param.util.js";
import { prisma } from "../../../../db/db.js";
import { manualAssignLead } from "../assignment.service.js";
import { LeadStatus } from "@prisma/client";
/**
 * GET /api/leads/escalated
 * Returns paginated list of escalated leads.
 */
export async function listEscalatedHandler(req, res, next) {
    try {
        const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
        const limit = Math.min(100, parseInt(String(req.query.limit ?? "50"), 10));
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            prisma.lead.findMany({
                where: { status: LeadStatus.UNASSIGNED_ESCALATED },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.lead.count({ where: { status: LeadStatus.UNASSIGNED_ESCALATED } }),
        ]);
        res.json({ ok: true, data: items, meta: { total, page, limit } });
    }
    catch (e) {
        next(e);
    }
}
/**
 * POST /api/leads/escalated/:id/assign
 * Body: { userId: string }
 *
 * Assign an escalated lead to a user (admin action).
 */
export async function assignEscalatedHandler(req, res, next) {
    try {
        const leadId = asString(req.params.id);
        const userId = typeof req.body?.userId === "string" ? req.body.userId : "";
        const actorId = req.user?.id ?? "system";
        if (!leadId || !userId) {
            return res
                .status(400)
                .json({ ok: false, error: "leadId and userId are required" });
        }
        // Create a manual assignment row and set lead.assignedToId (the manualAssignLead handles meta/job cancellations)
        await manualAssignLead(leadId, null, userId, actorId);
        // mark lead as assigned (manualAssignLead already updates assignedAt)
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: LeadStatus.ASSIGNED },
        });
        res.json({ ok: true });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=admin.controller.js.map