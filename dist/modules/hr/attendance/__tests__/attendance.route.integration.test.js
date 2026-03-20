// src/modules/hr/attendance/__tests__/attendance.route.integration.test.ts
import { describe, it, expect, beforeEach, jest, afterEach, } from "@jest/globals";
import request from "supertest";
import { prisma } from "../../../../db/db.js";
import { userFactory, teamFactory, teamMemberFactory, } from "../../../../tests/common/factories/index.js";
import { generateAuthToken, grantPermissions, } from "../../../../tests/common/helpers/auth.helper.js";
import app from "../../../../modules/app/app.js";
// Mock Audit Utility to avoid side effects
jest.unstable_mockModule("@/utils/audit.util.js", () => ({
    logAudit: jest.fn(async () => { }),
}));
describe("Attendance Submodule - Integration", () => {
    let user;
    let token;
    beforeEach(async () => {
        // Silence console.error to keep test output clean
        jest.spyOn(console, "error").mockImplementation(() => { });
        // 1. Create User
        user = await userFactory.create();
        token = `Bearer ${generateAuthToken(user)}`;
        // 2. Grant necessary permissions to bypass requirePermission middleware
        await grantPermissions(user.id, ["attendance.self", "attendance.read"]);
    });
    afterEach(() => {
        // Restore console.error after each test
        jest.restoreAllMocks();
    });
    describe("POST /api/hr/attendance/checkin", () => {
        it("should allow a valid checkin", async () => {
            const payload = {
                latitude: 12.9716,
                longitude: 77.5946,
                accuracy: 15,
                note: "Office Checkin",
            };
            const res = await request(app)
                .post("/api/hr/attendance/checkin")
                .set("Authorization", token)
                .send(payload);
            expect(res.status).toBe(201);
            expect(res.body.attendance).toMatchObject({
                userId: user.id,
                latitude: 12.9716,
                status: "ACCEPTED",
            });
            // Verify LocationLog was created via transaction
            const log = await prisma.locationLog.findFirst({
                where: { userId: user.id },
            });
            expect(log).toBeDefined();
        });
        it("should return 400 if user checks in twice on the same day", async () => {
            await prisma.attendance.create({
                data: { userId: user.id, status: "ACCEPTED", checkinAt: new Date() },
            });
            const res = await request(app)
                .post("/api/hr/attendance/checkin")
                .set("Authorization", token)
                .send({ latitude: 10, longitude: 10 });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain("already checked in today");
        });
    });
    describe("POST /api/hr/attendance/checkout", () => {
        it("should update attendance with checkout time", async () => {
            await prisma.attendance.create({
                data: { userId: user.id, status: "ACCEPTED", checkinAt: new Date() },
            });
            const res = await request(app)
                .post("/api/hr/attendance/checkout")
                .set("Authorization", token)
                .send();
            expect(res.status).toBe(200);
            expect(res.body.checkoutAt).toBeDefined();
        });
        it("should fail checkout if no checkin exists for today", async () => {
            const res = await request(app)
                .post("/api/hr/attendance/checkout")
                .set("Authorization", token)
                .send();
            expect(res.status).toBe(400);
            expect(res.body.message).toContain("haven’t checked in today");
        });
    });
    describe("GET /api/hr/attendance", () => {
        it("should filter attendance by team", async () => {
            const team = await teamFactory.create();
            await teamMemberFactory.create({
                userId: user.id,
                teamId: team.id,
            });
            await prisma.attendance.create({
                data: { userId: user.id, status: "ACCEPTED", checkinAt: new Date() },
            });
            const res = await request(app)
                .get("/api/hr/attendance")
                .set("Authorization", token)
                .query({ teamId: team.id });
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(1);
        });
    });
});
//# sourceMappingURL=attendance.route.integration.test.js.map