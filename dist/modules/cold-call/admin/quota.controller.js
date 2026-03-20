import { setTeamQuota, getTeamQuotas, getTeamQuotaProgress, } from "./quota.service.js";
import { setQuotaSchema } from "../analytics/validator/validator.analytics.js";
import { toStringSafe } from "../../../utils/fix.js";
export async function setQuotaHandler(req, res, next) {
    try {
        const parseResult = setQuotaSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                ok: false,
                error: "Invalid payload",
                details: parseResult.error.flatten(),
            });
        }
        const { teamId, period, metric, target } = parseResult.data;
        const q = await setTeamQuota(teamId, period, metric, target);
        res.json({ ok: true, data: q });
    }
    catch (err) {
        next(err);
    }
}
export async function listQuotasHandler(req, res, next) {
    try {
        const teamId = toStringSafe(req.params.teamId);
        if (!teamId)
            throw new Error("teamId is required");
        const r = await getTeamQuotas(teamId);
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
export async function quotaProgressHandler(req, res, next) {
    try {
        const teamId = toStringSafe(req.params.teamId);
        if (!teamId)
            throw new Error("teamId is required");
        const r = await getTeamQuotaProgress(teamId, req.query.period ?? "daily");
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=quota.controller.js.map