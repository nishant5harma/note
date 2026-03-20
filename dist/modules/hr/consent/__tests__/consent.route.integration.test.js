// src/modules/hr/consent/__tests__/consent.route.integration.test.ts
import { describe, it, expect, beforeEach, jest, afterEach, } from "@jest/globals";
import request from "supertest";
import { prisma } from "../../../../db/db.js";
import { userFactory } from "../../../../tests/common/factories/index.js";
import { generateAuthToken, grantPermissions, } from "../../../../tests/common/helpers/auth.helper.js";
import app from "../../../../modules/app/app.js";
describe("Consent Submodule - Integration", () => {
    let user;
    let token;
    beforeEach(async () => {
        user = await userFactory.create();
        token = `Bearer ${generateAuthToken(user)}`;
        // Ensure user has both read and write permissions for consent
        await grantPermissions(user.id, ["consent.read", "consent.write"]);
        // Silence console.error for expected 400 errors in tests
        jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe("POST /api/hr/consent", () => {
        it("should allow a user to grant LOCATION consent", async () => {
            const payload = {
                type: "LOCATION",
                version: "v1.0",
                meta: { device: "iPhone 15" },
            };
            const res = await request(app)
                .post("/api/hr/consent") // Note: hr.routes mounts ConsentRouter at /consent
                .set("Authorization", token)
                .send(payload);
            expect(res.status).toBe(201);
            expect(res.body.consent).toMatchObject({
                userId: user.id,
                type: "LOCATION",
                version: "v1.0",
            });
            // Verify DB entry exists
            const dbConsent = await prisma.consent.findFirst({
                where: { userId: user.id, type: "LOCATION" },
            });
            expect(dbConsent).toBeDefined();
        });
        it("should return 400 for an invalid consent type", async () => {
            const res = await request(app)
                .post("/api/hr/consent")
                .set("Authorization", token)
                .send({ type: "INVALID_TYPE" });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });
    describe("POST /api/hr/consent/revoke", () => {
        it("should revoke the latest active consent by type", async () => {
            // Setup: Create an active consent
            await prisma.consent.create({
                data: { userId: user.id, type: "LOCATION" },
            });
            const res = await request(app)
                .post("/api/hr/consent/revoke")
                .set("Authorization", token)
                .send({ type: "LOCATION" });
            expect(res.status).toBe(200);
            expect(res.body.consent.revokedAt).not.toBeNull();
            // Verify in DB
            const updated = await prisma.consent.findFirst({
                where: { userId: user.id, type: "LOCATION" },
            });
            expect(updated?.revokedAt).toBeDefined();
        });
        it("should revoke a specific consent by ID", async () => {
            const consent = await prisma.consent.create({
                data: { userId: user.id, type: "PHOTO" },
            });
            const res = await request(app)
                .post("/api/hr/consent/revoke")
                .set("Authorization", token)
                .send({ id: consent.id });
            expect(res.status).toBe(200);
            expect(res.body.consent.id).toBe(consent.id);
            expect(res.body.consent.revokedAt).not.toBeNull();
        });
        it("should return 404 if revoking a non-existent active consent by type", async () => {
            const res = await request(app)
                .post("/api/hr/consent/revoke")
                .set("Authorization", token)
                .send({ type: "TERMS" });
            expect(res.status).toBe(404);
        });
    });
    describe("GET /api/hr/consent", () => {
        it("should list all consents for the authenticated user", async () => {
            // Setup: Create multiple consents
            await prisma.consent.createMany({
                data: [
                    { userId: user.id, type: "LOCATION" },
                    { userId: user.id, type: "PHOTO" },
                ],
            });
            const res = await request(app)
                .get("/api/hr/consent")
                .set("Authorization", token);
            expect(res.status).toBe(200);
            expect(res.body.consents).toHaveLength(2);
            expect(res.body.consents[0]).toHaveProperty("type");
        });
    });
});
//# sourceMappingURL=consent.route.integration.test.js.map