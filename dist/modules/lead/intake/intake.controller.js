import { handleWebhook as handleWebhookService } from "./intake.service.js";
export async function webhookHandler(req, res, next) {
    try {
        // raw body string is set by hmac middleware from req.body (Buffer)
        const rawBodyString = req.rawBodyString ?? (req.body ? req.body.toString("utf8") : "");
        const headers = req.headers;
        const result = await handleWebhookService(rawBodyString, headers);
        // Always return 200 or 201 depending on result.note
        if (result.note === "created")
            return res.status(201).json(result);
        return res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=intake.controller.js.map