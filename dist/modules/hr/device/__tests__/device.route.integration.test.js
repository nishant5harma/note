// src/modules/hr/device/__tests__/device.route.integration.test.ts
import { describe, it, expect, beforeEach, jest, afterEach, } from "@jest/globals";
import request from "supertest";
import { prisma } from "../../../../db/db.js";
import { userFactory } from "../../../../tests/common/factories/index.js";
import { generateAuthToken, grantPermissions, } from "../../../../tests/common/helpers/auth.helper.js";
import app from "../../../../modules/app/app.js";
describe("Device Submodule - Route Integration", () => {
    let user;
    let token;
    // Adjusted path to standard mounting: /api/hr/device
    const BASE_PATH = "/api/hr/devices";
    beforeEach(async () => {
        user = await userFactory.create();
        token = `Bearer ${generateAuthToken(user)}`;
        await grantPermissions(user.id, [
            "device.register",
            "device.unregister",
            "device.read",
        ]);
        jest.spyOn(console, "error").mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe("POST /register", () => {
        it("should register a new device", async () => {
            const payload = {
                deviceId: "unique-hw-id",
                platform: "ios",
                pushToken: "tok_123",
            };
            const res = await request(app)
                .post(`${BASE_PATH}/register`)
                .set("Authorization", token)
                .send(payload);
            expect(res.status).toBe(201);
            expect(res.body.device.deviceId).toBe("unique-hw-id");
        });
        it("should return 400 for invalid platform", async () => {
            const res = await request(app)
                .post(`${BASE_PATH}/register`)
                .set("Authorization", token)
                .send({ platform: "windows" });
            expect(res.status).toBe(400);
        });
    });
    describe("POST /unregister", () => {
        it("should unregister a device by deviceId", async () => {
            await prisma.device.create({
                data: { userId: user.id, deviceId: "to-delete" },
            });
            const res = await request(app)
                .post(`${BASE_PATH}/unregister`)
                .set("Authorization", token)
                .send({ deviceId: "to-delete" });
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
        });
    });
});
//# sourceMappingURL=device.route.integration.test.js.map