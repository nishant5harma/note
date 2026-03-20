import { sendLocationFetchSignal, sendPushToUser, } from "../socket/util-socket/push.sender.js";
export async function pushTestHandler(req, res, next) {
    try {
        const { userId, type } = req.body;
        if (!userId)
            return res.status(400).json({ error: "userId required" });
        if (type === "fetch") {
            const r = await sendLocationFetchSignal(userId, req.body.requestId ?? "test-req");
            return res.json({ ok: true, result: r });
        }
        const r = await sendPushToUser(userId, {
            type: "DEBUG_PUSH",
            payload: req.body.payload ?? {},
        });
        return res.json({ ok: true, result: r });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=debug.controller.js.map