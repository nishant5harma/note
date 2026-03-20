import { asString } from "../../../utils/param.util.js";
import { setTeamQuota, getTeamQuotas, getTeamQuotaProgress, } from "./quota.service.js";
import { setQuotaSchema } from "../analytics/validator/validator.analytics.js";
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
        const teamId = asString(req.params.teamId);
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
        const teamId = asString(req.params.teamId);
        if (!teamId)
            throw new Error("teamId is required");
        const periodRaw = req.query.period;
        const period = typeof periodRaw === "string"
            ? periodRaw
            : Array.isArray(periodRaw) && typeof periodRaw[0] === "string"
                ? periodRaw[0]
                : "daily";
        const r = await getTeamQuotaProgress(teamId, period || "daily");
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=quota.controller.js.map