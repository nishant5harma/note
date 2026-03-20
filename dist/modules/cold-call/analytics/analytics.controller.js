import { asString } from "../../../utils/param.util.js";
import { getAgentPerformance, getTeamPerformance, getLeaderboard, } from "./analytics.service.js";
import { parseISO } from "date-fns";
export async function agentPerformanceHandler(req, res, next) {
    try {
        const userId = asString(req.params.userId);
        if (!userId)
            throw new Error("userId is required");
        const from = req.query.from ? parseISO(String(req.query.from)) : undefined;
        const r = await getAgentPerformance(userId, from);
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
export async function teamPerformanceHandler(req, res, next) {
    try {
        const teamId = asString(req.params.teamId);
        if (!teamId)
            throw new Error("teamId is required");
        const from = req.query.from ? parseISO(String(req.query.from)) : undefined;
        const r = await getTeamPerformance(teamId, from);
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
export async function leaderboardHandler(req, res, next) {
    try {
        const metric = req.query.metric ?? "conversions";
        const days = parseInt(String(req.query.days ?? "7"), 10);
        const topN = parseInt(String(req.query.top ?? "10"), 10);
        const r = await getLeaderboard(topN, metric, days);
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=analytics.controller.js.map