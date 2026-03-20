// src/modules/inventory/reservation/worker/reconciliation.worker.ts
import { prisma } from "../../../../db/db.js";
import { ReservationStatus } from "@prisma/client";
import { tryAcquireLock, releaseLock } from "../../../../utils/redis.lock.js";
import { reservationExpirationQueue } from "./reservation.worker.js";
/**
 * Reconciliation job:
 * - Find ACTIVE reservations whose expiresAt < now
 * - Acquire lock per reservation resource (unit/listing)
 * - Expire reservation + free inventory
 * - Remove TTL job from Bull + delete ReservationTTLJob (canonical source)
 */
export async function runReservationReconciliation(limit = 200) {
    const now = new Date();
    const overdue = await prisma.reservation.findMany({
        where: {
            status: ReservationStatus.ACTIVE,
            expiresAt: { lt: now },
        },
        take: limit,
    });
    let processed = 0;
    for (const r of overdue) {
        const lockKey = r.unitId
            ? `lock:unit:reserve:${r.unitId}`
            : `lock:listing:reserve:${r.listingId}`;
        const { acquiredLock, token } = await tryAcquireLock(lockKey, 10_000);
        if (!acquiredLock || !token) {
            console.log(`Reconciliation: skip ${r.id}, resource busy`);
            continue;
        }
        try {
            // Use a transaction for correctness
            await prisma.$transaction(async (tx) => {
                const fresh = await tx.reservation.findUnique({
                    where: { id: r.id },
                });
                if (!fresh)
                    return;
                const status = String(fresh.status ?? "").toLowerCase();
                if (status !== "active")
                    return;
                // reservation became valid again somehow
                if (new Date(fresh.expiresAt) > now)
                    return;
                // Mark expired
                await tx.reservation.update({
                    where: { id: r.id },
                    data: {
                        status: "EXPIRED",
                        cancelledAt: new Date(),
                    },
                });
                // Free inventory
                if (fresh.unitId) {
                    await tx.unit.update({
                        where: { id: fresh.unitId },
                        data: { status: "AVAILABLE" },
                    });
                }
                if (fresh.listingId) {
                    await tx.listing.update({
                        where: { id: fresh.listingId },
                        data: { status: "AVAILABLE" },
                    });
                }
                // Remove TTL job if exists
                try {
                    const ttlRow = await tx.reservationTTLJob.findUnique({
                        where: { reservationId: r.id },
                    });
                    if (ttlRow) {
                        // remove job from Bull
                        try {
                            const job = await reservationExpirationQueue.getJob(ttlRow.jobId);
                            if (job)
                                await job.remove();
                        }
                        catch (jobErr) {
                            console.warn(`Reconciliation: failed to remove Bull job for ${r.id}`, jobErr);
                        }
                        // delete DB record
                        try {
                            await tx.reservationTTLJob.delete({
                                where: { reservationId: r.id },
                            });
                        }
                        catch (dbErr) {
                            console.warn(`Reconciliation: failed to delete TTL record for ${r.id}`, dbErr);
                        }
                    }
                }
                catch (ttlErr) {
                    console.warn(`Reconciliation: TTL cleanup error for reservation ${r.id}`, ttlErr);
                }
                // TODO: audit auto-expire
            });
            processed++;
        }
        catch (e) {
            console.warn(`Reconciliation failed for reservation ${r.id}:`, e);
        }
        finally {
            await releaseLock(lockKey, token);
        }
    }
    return { processed };
}
//# sourceMappingURL=reconciliation.worker.js.map