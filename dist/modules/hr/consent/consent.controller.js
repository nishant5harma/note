import { consentCreateSchema } from "./validator/consent.validator.js";
import { createConsent, revokeConsent, listConsents, } from "./consent.service.js";
import { z } from "zod";
/**
 * POST /api/consent
 */
export async function createConsentHandler(req, res, next) {
    try {
        const data = consentCreateSchema.parse(req.body);
        if (!req.user)
            return res.status(401).json({ error: "unauthenticated" });
        const row = await createConsent({
            userId: req.user.id,
            type: data.type,
            version: data.version ?? null,
            meta: data.meta,
        });
        // audit placeholder
        // TODO: replace with central audit module
        // you already have logAudit helper; if available, call it here
        return res.status(201).json({ consent: row });
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return res.status(400).json({ error: z.treeifyError(err) });
        next(err);
    }
}
/**
 * POST /api/consent/revoke
 */
export async function revokeConsentHandler(req, res, next) {
    try {
        if (!req.user)
            return res.status(401).json({ error: "unauthenticated" });
        const { id, type } = req.body;
        if (type && !["LOCATION", "PHOTO", "TERMS"].includes(type)) {
            return res.status(400).json({ error: "Invalid consent type" });
        }
        const params = { userId: req.user.id };
        if (id)
            params.id = id;
        if (type)
            params.type = type;
        const row = await revokeConsent(params);
        return res.json({ consent: row });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/consent (list for user)
 */
export async function listConsentsHandler(req, res, next) {
    try {
        if (!req.user)
            return res.status(401).json({ error: "unauthenticated" });
        const rows = await listConsents(req.user.id);
        return res.json({ consents: rows });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=consent.controller.js.map