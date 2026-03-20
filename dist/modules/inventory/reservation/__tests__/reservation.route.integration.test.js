// src/modules/inventory/reservation/__tests__/reservation.route.integration.test.ts
import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "../../../../tests/common/mocks/socket.mock.js";
import "../../../../tests/common/mocks/reservation-worker.mock.js";
import { createTestApp } from "../../../../tests/common/helpers/create-test-app.js";
import { createAuthContext } from "../../../../tests/common/helpers/auth-scenario.helper.js";
/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Reservation Routes (integration)", () => {
    let app;
    let unitId;
    beforeEach(async () => {
        app = await createTestApp();
        const project = await prisma.project.create({
            data: { name: "Reservation Route Project" },
        });
        const unit = await prisma.unit.create({
            data: {
                projectId: project.id,
                unitNumber: "RU-1",
                status: "AVAILABLE",
            },
        });
        unitId = unit.id;
    });
    it("creates reservation", async () => {
        const { token } = await createAuthContext([
            "inventory.read",
            "inventory.write",
        ]);
        const res = await request(app)
            .post("/api/inventory/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({ unitId });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("ACTIVE");
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        expect(unit.status).toBe("BLOCKED");
    });
    it("lists reservations", async () => {
        const { token } = await createAuthContext(["inventory.read"]);
        await prisma.reservation.create({
            data: {
                unitId,
                status: "ACTIVE",
                expiresAt: new Date(Date.now() + 60000),
            },
        });
        const res = await request(app)
            .get("/api/inventory/reservations")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });
    it("blocks unauthenticated access", async () => {
        const { token } = await createAuthContext([]);
        const res = await request(app)
            .get("/api/inventory/reservations")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});
//# sourceMappingURL=reservation.route.integration.test.js.map