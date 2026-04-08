import { Router, raw } from "express";
import { verifyHmacMiddleware } from "../../../middlewares/hmac.middleware.js";
import { webhookHandler } from "./intake.controller.js";
export const IntakeRouter = Router();
/**
 * Use raw body so we can compute HMAC over exact bytes.
 * Accept any content-type; you may limit to application/json if desired.
 */
IntakeRouter.get("/", (req, res) => {
    // Meta/Facebook Webhooks verification handshake
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN ??
        process.env.FACEBOOK_VERIFY_TOKEN ??
        process.env.WEBHOOK_VERIFY_TOKEN_FACEBOOK ??
        process.env.WEBHOOK_VERIFY_TOKEN ??
        null;
    if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
        return res.status(200).send(String(challenge ?? ""));
    }
    return res.sendStatus(403);
});
IntakeRouter.post("/", raw({ type: "*/*", limit: "1mb" }), verifyHmacMiddleware, // reads req.rawBody and verifies signature
webhookHandler);
export default IntakeRouter;
//# sourceMappingURL=intake.route.js.map