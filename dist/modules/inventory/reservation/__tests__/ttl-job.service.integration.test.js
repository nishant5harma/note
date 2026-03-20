// src/modules/inventory/reservation/__tests__/ttl-job.service.integration.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { saveTTLJob, getTTLJob, deleteTTLJob, } from "../helper-services/ttl-job.service.js";
describe("Reservation TTL Job Service (integration)", () => {
    let reservationId;
    beforeEach(async () => {
        const project = await prisma.project.create({
            data: { name: "TTL Project" },
        });
        const unit = await prisma.unit.create({
            data: { projectId: project.id, unitNumber: "TTL-U" },
        });
        const r = await prisma.reservation.create({
            data: {
                unitId: unit.id,
                status: "ACTIVE",
                expiresAt: new Date(Date.now() + 60_000),
            },
        });
        reservationId = r.id;
    });
    it("creates TTL job record", async () => {
        await saveTTLJob(reservationId, "job-1");
        const row = await getTTLJob(reservationId);
        expect(row).not.toBeNull();
        expect(row.jobId).toBe("job-1");
    });
    it("updates TTL job record (upsert)", async () => {
        await saveTTLJob(reservationId, "job-1");
        await saveTTLJob(reservationId, "job-2");
        const row = await getTTLJob(reservationId);
        expect(row.jobId).toBe("job-2");
    });
    it("deletes TTL job record safely", async () => {
        await saveTTLJob(reservationId, "job-1");
        await deleteTTLJob(reservationId);
        const row = await getTTLJob(reservationId);
        expect(row).toBeNull();
    });
    it("delete is idempotent", async () => {
        await expect(deleteTTLJob(reservationId)).resolves.toBeNull();
    });
});
//# sourceMappingURL=ttl-job.service.integration.test.js.map