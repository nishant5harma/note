// src/modules/inventory/listing/__tests__/listing.service.integration.test.ts
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { UnitStatus } from "@prisma/client";
/* ------------------------------------------------------------------ */
/* ✅ REQUIRED MOCKS (DIRECT DEPENDENCIES ONLY)                        */
/* ------------------------------------------------------------------ */
import "../../../../tests/common/mocks/redis-lock.mock.js";
jest.unstable_mockModule("../../unit/unit.service.js", () => ({
    __esModule: true,
    sellUnit: async () => ({
        id: "unit-id",
        status: UnitStatus.SOLD,
    }),
}));
jest.unstable_mockModule("../../reservation/reservation.service.js", () => ({
    __esModule: true,
    cancelActiveReservationsForListing: async () => 1,
}));
/* ------------------------------------------------------------------ */
/* 📦 IMPORT AFTER MOCKS                                               */
/* ------------------------------------------------------------------ */
const { createListing, getListing, listListings, updateListing, closeListing, deleteListing, } = await import("../listing.service.js");
/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                            */
/* ------------------------------------------------------------------ */
describe("Inventory Listing Service (integration)", () => {
    beforeEach(async () => {
        // DB is reset globally
    });
    it("creates a listing", async () => {
        const l = await createListing({
            title: "Test Listing",
            type: "SALE",
            city: "Delhi",
        });
        expect(l.id).toBeDefined();
        expect(l.title).toBe("Test Listing");
    });
    it("gets listing with relations", async () => {
        const listing = await prisma.listing.create({
            data: { title: "Get Me", type: "RENT" },
        });
        const found = await getListing(listing.id);
        expect(found).not.toBeNull();
        expect(found.id).toBe(listing.id);
    });
    it("lists listings with filters, sort and pagination", async () => {
        await prisma.listing.createMany({
            data: [
                { title: "A", type: "SALE", city: "Delhi", price: BigInt(100) },
                { title: "B", type: "SALE", city: "Delhi", price: BigInt(200) },
                { title: "C", type: "RENT", city: "Mumbai", price: BigInt(300) },
            ],
        });
        const res = await listListings({
            city: "Delhi",
            sort: "price_desc",
            page: 1,
            limit: 1,
        });
        expect(res.items).toHaveLength(1);
        expect(res.meta.total).toBe(2);
        expect(res.items[0].price).toBe(BigInt(200));
    });
    it("updates listing using redis lock", async () => {
        const listing = await prisma.listing.create({
            data: { title: "Old", type: "SALE" },
        });
        const updated = await updateListing(listing.id, {
            title: "New",
        });
        expect(updated.title).toBe("New");
    });
    it("closes listing and marks it CLOSED", async () => {
        const listing = await prisma.listing.create({
            data: { title: "Close Me", type: "SALE" },
        });
        const closed = await closeListing(listing.id, {
            closedBy: "user-1",
            note: "done",
        });
        expect(closed).not.toBeNull();
        expect(closed.status).toBe("CLOSED");
    });
    it("deletes listing using redis lock", async () => {
        const listing = await prisma.listing.create({
            data: { title: "Delete Me", type: "SALE" },
        });
        await deleteListing(listing.id);
        const found = await prisma.listing.findUnique({
            where: { id: listing.id },
        });
        expect(found).toBeNull();
    });
});
//# sourceMappingURL=listing.service.integration.test.js.map