// src/middlewares/__tests__/hmac.middleware.unit.test.ts
import { jest, describe, it, expect, beforeEach, afterEach, } from "@jest/globals";
import crypto from "crypto";
import { verifyHmacMiddleware } from "../hmac.middleware.js";
describe("verifyHmacMiddleware", () => {
    const secret = "test-secret";
    const body = JSON.stringify({ event: "lead.created", id: 123 });
    let warnSpy;
    beforeEach(() => {
        // Silence console.warn in test output but keep it trackable
        warnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
        // Set up default environment for most tests
        process.env.WEBHOOK_SECRET_DEFAULT = secret;
        process.env.WEBHOOK_SECRET_FACEBOOK = "fb-secret";
    });
    afterEach(() => {
        warnSpy.mockRestore();
        // Clean up to prevent leaking state between tests
        delete process.env.WEBHOOK_SECRET_DEFAULT;
        delete process.env.WEBHOOK_SECRET_FACEBOOK;
    });
    const generateSignature = (data, key) => {
        return ("sha256=" + crypto.createHmac("sha256", key).update(data).digest("hex"));
    };
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnThis();
        res.json = jest.fn().mockReturnThis();
        return res;
    };
    it("accepts valid signature with default secret", async () => {
        const req = {
            headers: { "x-signature": generateSignature(body, secret) },
            body: body,
        };
        const next = jest.fn();
        await verifyHmacMiddleware(req, mockResponse(), next);
        expect(next).toHaveBeenCalledWith();
        expect(req.rawBodyString).toBe(body);
    });
    it("switches to provider-specific secret based on x-lead-source", async () => {
        const fbBody = "facebook-data";
        const req = {
            headers: {
                "x-lead-source": "facebook",
                "x-signature": generateSignature(fbBody, "fb-secret"),
            },
            body: fbBody,
        };
        const next = jest.fn();
        await verifyHmacMiddleware(req, mockResponse(), next);
        expect(next).toHaveBeenCalledWith();
    });
    it("rejects invalid signatures with 403", async () => {
        const req = {
            headers: { "x-signature": "sha256=wrong-hash" },
            body: body,
        };
        const res = mockResponse();
        const next = jest.fn();
        await verifyHmacMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "Invalid signature" }));
        expect(next).not.toHaveBeenCalled();
    });
    it("handles body as a Buffer correctly", async () => {
        const bufferBody = Buffer.from("raw-binary-data");
        const req = {
            headers: { "x-signature": generateSignature("raw-binary-data", secret) },
            body: bufferBody,
        };
        const next = jest.fn();
        await verifyHmacMiddleware(req, mockResponse(), next);
        expect(next).toHaveBeenCalled();
        expect(req.rawBodyString).toBe("raw-binary-data");
    });
    it("rejects empty body with 400", async () => {
        const req = {
            headers: { "x-signature": "some-sig" },
            body: null,
        };
        const res = mockResponse();
        const next = jest.fn();
        await verifyHmacMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });
    it("skips verification and calls next() if no secret is configured for provider", async () => {
        // ARRANGE: Remove secrets to trigger the fallback logic
        delete process.env.WEBHOOK_SECRET_DEFAULT;
        const req = {
            headers: { "x-lead-source": "unknown-provider" },
            body: { some: "data" },
        };
        const next = jest.fn();
        const res = mockResponse();
        // ACT
        await verifyHmacMiddleware(req, res, next);
        // ASSERT: Should log a warning and let the request through
        expect(warnSpy).toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });
});
//# sourceMappingURL=hmac.middleware.unit.test.js.map