// /src/modules/inventory/reservation/worker/reservation.worker.ts
import { Queue, Worker } from "bullmq";
import { getRedisClient } from "@/db/redis.js";
import { prisma } from "@/db/db.js";

const connection = getRedisClient();

// queue used for scheduled expiration jobs
const RESERVATION_EXPIRATION_QUEUE = process.env.BULLMQ_PREFIX
  ? `${process.env.BULLMQ_PREFIX}reservation-expire`
  : "reservation-expire";

export const reservationExpirationQueue = new Queue(
  RESERVATION_EXPIRATION_QUEUE,
  {
    connection,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: 50 },
  }
);

/**
 * Enqueue expiration for reservationId at given expiresAt Date
 * Also persist a ReservationTTLJob row as the canonical source of jobId.
 * Returns jobId (string).
 */
export async function enqueueReservationExpiration(
  reservationId: string,
  expiresAt: Date
): Promise<string> {
  const delay = Math.max(0, expiresAt.getTime() - Date.now());
  const jobId = `reservation-expire:${reservationId}`;
  const job = await reservationExpirationQueue.add(
    "expire",
    { reservationId },
    { jobId, delay }
  );

  // persist TTL job record (upsert to be idempotent)
  try {
    await prisma.reservationTTLJob.upsert({
      where: { reservationId },
      update: {
        jobId: String(job.id),
        expiresAt,
      },
      create: {
        reservationId,
        jobId: String(job.id),
        expiresAt,
      },
    });
  } catch (e) {
    console.warn(
      "enqueueReservationExpiration: failed to persist TTL job record",
      e
    );
    // best-effort — job is still scheduled
  }

  return String(job.id);
}

/**
 * Worker: process expiration
 * - if reservation still active and expiresAt <= now => mark EXPIRED and free unit/listing
 */
export function startReservationWorker() {
  const concurrency = Math.max(
    1,
    parseInt(process.env.INVENTORY_WORKER_CONCURRENCY ?? "1", 10)
  );
  const worker = new Worker(
    RESERVATION_EXPIRATION_QUEUE,
    async (job) => {
      const { reservationId } = job.data;
      const tx = await prisma.$transaction(async (tx) => {
        const r = await tx.reservation.findUnique({
          where: { id: reservationId },
        });
        if (!r) return null;

        // do case-insensitive check for active
        const status = String(r.status ?? "").toLowerCase();
        if (status !== "active") return null;
        if (new Date(r.expiresAt) > new Date()) return null;

        // mark expired and free unit/listing
        await tx.reservation.update({
          where: { id: reservationId },
          data: { status: "EXPIRED", cancelledAt: new Date() },
        });

        if (r.unitId) {
          await tx.unit.update({
            where: { id: r.unitId },
            data: { status: "AVAILABLE" },
          });
        }
        if (r.listingId) {
          await tx.listing.update({
            where: { id: r.listingId },
            data: { status: "AVAILABLE" },
          });
        }

        // Remove TTL job record for this reservation (best-effort)
        try {
          await tx.reservationTTLJob.delete({ where: { reservationId } });
        } catch (e) {
          // ignore - may already have been removed
        }

        // TODO: audit - inventory auto-release due TTL
        return true;
      });
      return tx;
    },
    { connection, concurrency }
  );

  worker.on("failed", (job, err) => {
    console.error("Reservation worker failed job", job?.id, err);
  });

  console.log("Reservation worker started (concurrency=", concurrency, ")");
}
