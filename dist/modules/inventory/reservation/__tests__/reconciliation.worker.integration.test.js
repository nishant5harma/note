// src/modules/inventory/reservation/__tests__/reconciliation.worker.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "../../../../db/db.js";
import { projectFactory } from "../../../../tests/common/factories/project.factory.js";
import { unitFactory } from "../../../../tests/common/factories/unit.factory.js";
import { reservationFactory } from "../../../../tests/common/factories/reservation.factory.js";
/* ------------------------------------------------------------------ */
/* ✅ REQUIRED MOCKS                                                   */
/* ------------------------------------------------------------------ */
import "../../../../tests/common/mocks/redis-lock.mock.js";
import "../../../../tests/common/mocks/reservation-worker.mock.js";
/* ------------------------------------------------------------------ */
/* 📦 IMPORT WORKER AFTER MOCKS                                       */
/* ------------------------------------------------------------------ */
const { runReservationReconciliation } = await import("../../../../modules/inventory/reservation/worker/reconciliation.worker.js");
/* ------------------------------------------------------------------ */
/* 🧪 TESTS                                                           */
/* ------------------------------------------------------------------ */
describe("reservation reconciliation worker", () => {
    it("expires overdue reservations and frees inventory", async () => {
        const project = await projectFactory.create();
        // Now create the Unit linked to that Project
        const unit = await unitFactory.create({
            projectId: project.id,
            status: "BLOCKED",
        });
        const res = await reservationFactory.create({
            unitId: unit.id,
            status: "ACTIVE",
            expiresAt: new Date(Date.now() - 60_000), // Overdue
        });
        // 3. Execute
        const result = await runReservationReconciliation(10);
        // 4. Assertions
        const refreshed = await prisma.reservation.findUnique({
            where: { id: res.id },
        });
        const unitAfter = await prisma.unit.findUnique({ where: { id: unit.id } });
        expect(result.processed).toBe(1);
        expect(refreshed?.status).toBe("EXPIRED");
        expect(unitAfter?.status).toBe("AVAILABLE");
    });
});
//# sourceMappingURL=reconciliation.worker.integration.test.js.map