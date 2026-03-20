// src/modules/hr/attendance/__tests__/attendance.service.integration.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AttendanceService } from "../attendance.service.js";
import { prisma } from "../../../../db/db.js";
import { userFactory } from "../../../../tests/common/factories/index.js";
describe("AttendanceService - Unit", () => {
    let testUser;
    beforeEach(async () => {
        testUser = await userFactory.create();
    });
    describe("createCheckin()", () => {
        it("should normalize undefined fields to null in database", async () => {
            const checkin = await AttendanceService.createCheckin(testUser, {
                note: "Note only",
            });
            expect(checkin.latitude).toBeNull();
            expect(checkin.longitude).toBeNull();
            expect(checkin.note).toBe("Note only");
        });
        it("should create a location access audit record", async () => {
            await AttendanceService.createCheckin(testUser, {
                latitude: 1.23,
                longitude: 4.56,
            });
            const audit = await prisma.locationAccessAudit.findFirst({
                where: { targetId: testUser.id },
            });
            expect(audit).toBeDefined();
            expect(audit?.action).toBe("checkin_created");
            // Use type assertion to access meta fields stored as JsonValue
            const meta = audit?.meta;
            expect(meta?.latitude).toBe(1.23);
        });
        it("should throw NotFoundError if user doesn't exist", async () => {
            const fakeUser = { id: "00000000-0000-0000-0000-000000000000" };
            await expect(AttendanceService.createCheckin(fakeUser, {})).rejects.toThrow(/not found/i);
        });
    });
    describe("listAttendance()", () => {
        it("should handle pagination correctly", async () => {
            // Seed 3 records on different days to bypass "already checked in" logic if necessary
            for (let i = 0; i < 3; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                await prisma.attendance.create({
                    data: {
                        userId: testUser.id,
                        status: "ACCEPTED",
                        checkinAt: date,
                    },
                });
            }
            const result = await AttendanceService.listAttendance({
                page: 1,
                limit: 2,
            });
            expect(result.rows.length).toBe(2);
            expect(result.count).toBe(3);
        });
        it("should filter by date range", async () => {
            const oldDate = new Date("2020-01-01");
            await prisma.attendance.create({
                data: { userId: testUser.id, status: "ACCEPTED", checkinAt: oldDate },
            });
            const result = await AttendanceService.listAttendance({
                from: "2023-01-01",
                to: "2023-12-31",
            });
            expect(result.count).toBe(0);
        });
    });
});
//# sourceMappingURL=attendance.service.integration.test.js.map