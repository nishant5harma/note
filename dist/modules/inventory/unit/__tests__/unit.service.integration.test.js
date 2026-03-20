// src/modules/inventory/unit/__tests__/unit.service.integration.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { ReservationStatus } from "@prisma/client";
/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "../../../../tests/common/mocks/redis-lock.mock.js";
import "../../../../tests/common/mocks/reservation-worker.mock.js";
/* ------------------------------------------------------------------ */
/* 📦 IMPORT AFTER MOCKS                                              */
/* ------------------------------------------------------------------ */
const { createUnit, getUnit, listUnits, updateUnit, sellUnit, deleteUnit } = await import("../unit.service.js");
/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("Inventory Unit Service (integration)", () => {
    let projectId;
    beforeEach(async () => {
        const project = await prisma.project.create({
            data: { name: "Test Project" },
        });
        projectId = project.id;
    });
    it("creates a unit", async () => {
        const u = await createUnit({
            projectId,
            unitNumber: "A-101",
            price: BigInt(100),
        });
        expect(u.id).toBeDefined();
        expect(u.unitNumber).toBe("A-101");
    });
    it("gets unit with relations", async () => {
        const unit = await prisma.unit.create({
            data: { projectId, unitNumber: "A-102" },
        });
        const found = await getUnit(unit.id);
        expect(found).not.toBeNull();
        expect(found.id).toBe(unit.id);
    });
    it("lists units with filters & pagination", async () => {
        await prisma.unit.createMany({
            data: [
                { projectId, unitNumber: "U1", price: BigInt(100) },
                { projectId, unitNumber: "U2", price: BigInt(200) },
                { projectId, unitNumber: "U3", price: BigInt(300) },
            ],
        });
        const res = await listUnits({
            priceMin: 150,
            sort: "price_desc",
            limit: 1,
            page: 1,
        });
        expect(res.items).toHaveLength(1);
        expect(res.meta.total).toBe(2);
        expect(res.items[0].price).toBe(BigInt(300));
    });
    it("updates unit using redis lock", async () => {
        const unit = await prisma.unit.create({
            data: { projectId, unitNumber: "OLD" },
        });
        const updated = await updateUnit(unit.id, {
            unitNumber: "NEW",
        });
        expect(updated.unitNumber).toBe("NEW");
    });
    it("prevents updating SOLD unit", async () => {
        const unit = await prisma.unit.create({
            data: {
                projectId,
                unitNumber: "SOLD-1",
                status: "SOLD",
            },
        });
        await expect(updateUnit(unit.id, { unitNumber: "X" })).rejects.toThrow("already SOLD");
    });
    it("sells unit, cancels reservations & closes listings", async () => {
        const unit = await prisma.unit.create({
            data: { projectId, unitNumber: "SELL-ME" },
        });
        const listing = await prisma.listing.create({
            data: {
                title: "Linked Listing",
                type: "SALE",
                unitId: unit.id,
            },
        });
        const reservation = await prisma.reservation.create({
            data: {
                unitId: unit.id,
                status: ReservationStatus.ACTIVE,
                expiresAt: new Date(Date.now() + 60_000),
                meta: {},
            },
        });
        const sold = await sellUnit(unit.id, {
            soldBy: "user-1",
            price: BigInt(500),
            note: "done",
        });
        expect(sold.status).toBe("SOLD");
        const updatedListing = await prisma.listing.findUnique({
            where: { id: listing.id },
        });
        expect(updatedListing.status).toBe("CLOSED");
        const updatedReservation = await prisma.reservation.findUnique({
            where: { id: reservation.id },
        });
        expect(updatedReservation.status).toBe("CANCELLED");
    });
    it("deletes unit using redis lock", async () => {
        const unit = await prisma.unit.create({
            data: { projectId, unitNumber: "DEL" },
        });
        await deleteUnit(unit.id);
        const found = await prisma.unit.findUnique({
            where: { id: unit.id },
        });
        expect(found).toBeNull();
    });
});
//# sourceMappingURL=unit.service.integration.test.js.map