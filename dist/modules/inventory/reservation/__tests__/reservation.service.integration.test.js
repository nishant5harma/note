// src/modules/inventory/reservation/__tests__/reservation.service.integration.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { ReservationStatus } from "@prisma/client";
/* ------------------------------------------------------------------ */
/* ✅ GLOBAL TEST HELPERS & MOCKS                                      */
/* ------------------------------------------------------------------ */
import "../../../../tests/common/mocks/redis-lock.mock.js";
import "../../../../tests/common/mocks/reservation-worker.mock.js";
/* ------------------------------------------------------------- */
/* 📦 IMPORT SERVICE AFTER MOCKS                                  */
/* ------------------------------------------------------------- */
const { createReservation, cancelReservation, listReservations, getReservation, } = await import("../reservation.service.js");
describe("Reservation Service (integration)", () => {
    let projectId;
    let unitId;
    let listingId;
    beforeEach(async () => {
        const project = await prisma.project.create({
            data: { name: "Reservation Project" },
        });
        projectId = project.id;
        const unit = await prisma.unit.create({
            data: { projectId, unitNumber: "U-1", status: "AVAILABLE" },
        });
        unitId = unit.id;
        const listing = await prisma.listing.create({
            data: {
                title: "Listing",
                type: "SALE",
                projectId,
                status: "AVAILABLE",
            },
        });
        listingId = listing.id;
    });
    it("creates reservation for unit and blocks unit", async () => {
        const r = await createReservation({ unitId });
        expect(r.status).toBe(ReservationStatus.ACTIVE);
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        expect(unit.status).toBe("BLOCKED");
    });
    it("creates reservation for listing and marks UNDER_OFFER", async () => {
        const r = await createReservation({ listingId });
        expect(r.status).toBe(ReservationStatus.ACTIVE);
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        expect(listing.status).toBe("UNDER_OFFER");
    });
    it("prevents duplicate active reservation for unit", async () => {
        await createReservation({ unitId });
        await expect(createReservation({ unitId })).rejects.toThrow("Unit is not available for reservation");
    });
    it("cancels reservation and frees inventory", async () => {
        const r = await createReservation({ unitId });
        const cancelled = await cancelReservation(r.id, "tester");
        expect(cancelled.status).toBe("CANCELLED");
        const unit = await prisma.unit.findUnique({ where: { id: unitId } });
        expect(unit.status).toBe("AVAILABLE");
    });
    it("lists reservations by status", async () => {
        await createReservation({ unitId });
        const rows = await listReservations({ status: "ACTIVE" });
        expect(rows.length).toBe(1);
    });
    it("gets reservation with relations", async () => {
        const r = await createReservation({ unitId });
        const found = await getReservation(r.id);
        expect(found).not.toBeNull();
        expect(found.unit).not.toBeNull();
    });
});
//# sourceMappingURL=reservation.service.integration.test.js.map