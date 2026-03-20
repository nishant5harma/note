import { manualAssignLead } from "./assignment.service.js";
export async function manualAssignHandler(req, res, next) {
    try {
        const leadId = req.params.id;
        const { userId } = req.body;
        const actorId = req.user?.id ?? "system";
        if (typeof leadId !== "string" || !leadId.trim()) {
            return res.status(400).json({ ok: false, error: "leadId is required" });
        }
        await manualAssignLead(leadId, null, userId, actorId);
        return res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=assignment.controller.js.map