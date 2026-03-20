// /src/modules/inventory/reservation/reservation.service.ts
import { prisma } from "@/db/db.js";
import {
  enqueueReservationExpiration,
  reservationExpirationQueue,
} from "./worker/reservation.worker.js";
import { ReservationStatus } from "@prisma/client";
import { tryAcquireLock, releaseLock } from "@/utils/redis.lock.js";

const DEFAULT_TTL_MS = parseInt(
  process.env.DEFAULT_RESERVATION_TTL_MS ?? String(15 * 60 * 1000),
  10
); // 15 minutes default
const LOCK_TTL = 10_000; // 10s lock

/**
 * Helper to remove TTL job if it exists.
 * Now we look up ReservationTTLJob table (single source of truth).
 */
async function removeTtlJobIfExists(reservationId?: string | null) {
  if (!reservationId) return;
  try {
    const rec = await prisma.reservationTTLJob.findUnique({
      where: { reservationId },
    });
    if (!rec) return;
    const jobId = rec.jobId;
    // remove job from Bull queue (best-effort)
    try {
      const job = await reservationExpirationQueue.getJob(jobId);
      if (job) await job.remove();
    } catch (e) {
      console.warn("removeTtlJobIfExists: failed to remove job from queue", e);
    }

    // remove record
    try {
      await prisma.reservationTTLJob.delete({ where: { reservationId } });
    } catch (e) {
      console.warn(
        "removeTtlJobIfExists: failed to delete ReservationTTLJob record",
        e
      );
    }
  } catch (e) {
    console.warn("removeTtlJobIfExists failed", e);
  }
}

/**
 * createReservation:
 * - Acquire resource lock (unit or listing)
 * - validate business rules (no double-block, status checks)
 * - create Reservation row
 * - mark Unit (or Listing) as BLOCKED / UNDER_OFFER
 * - enqueue expiration job (worker will mark expired and register TTL row)
 */
export async function createReservation(data: any) {
  const ttlDefaultMs = DEFAULT_TTL_MS;
  const expiresAt = data.expiresAt
    ? new Date(String(data.expiresAt))
    : new Date(Date.now() + ttlDefaultMs);

  // Basic defensive validation: exactly one of unitId or listingId must be provided
  const unitId = data.unitId ?? null;
  const listingId = data.listingId ?? null;
  if ((unitId && listingId) || (!unitId && !listingId)) {
    throw new Error("Exactly one of unitId or listingId must be provided.");
  }

  // Acquire lock to prevent race conditions
  const lockKey = unitId
    ? `lock:unit:reserve:${unitId}`
    : `lock:listing:reserve:${listingId}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    // Re-check target inventory state to avoid reserving SOLD/BLOCKED/UNDER_OFFER
    if (unitId) {
      const unit = await prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) throw new Error("Unit not found");
      const st = String(unit.status ?? "available").toLowerCase();
      if (["blocked", "sold", "booked"].includes(st)) {
        throw new Error(
          `Unit is not available for reservation (status=${unit.status})`
        );
      }

      // prevent duplicate active reservations for this unit
      const existing = await prisma.reservation.findFirst({
        where: {
          unitId,
          OR: [{ status: ReservationStatus.ACTIVE }],
        },
      });
      if (existing) {
        throw new Error("Unit already has an active reservation.");
      }
    } else {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });
      if (!listing) throw new Error("Listing not found");
      const st = String(listing.status ?? "available").toLowerCase();
      if (!["available"].includes(st)) {
        throw new Error(
          `Listing is not available for reservation (status=${listing.status})`
        );
      }

      // prevent duplicate active reservations for this listing
      const existing = await prisma.reservation.findFirst({
        where: {
          listingId,
          OR: [{ status: ReservationStatus.ACTIVE }],
        },
      });
      if (existing) {
        throw new Error("Listing already has an active reservation.");
      }
    }

    // Create reservation + update inventory inside transaction
    const r = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          leadId: data.leadId ?? null,
          unitId: unitId ?? null,
          listingId: listingId ?? null,
          userId: data.userId ?? null,
          status: ReservationStatus.ACTIVE,
          expiresAt,
          reservedAt: new Date(),
          note: data.note ?? null,
          meta: data.meta ?? null,
        },
      });

      // Update unit/listing status
      if (unitId) {
        await tx.unit.update({
          where: { id: unitId },
          data: { status: "BLOCKED" },
        });
      }
      if (listingId) {
        await tx.listing.update({
          where: { id: listingId },
          data: { status: "UNDER_OFFER" },
        });
      }

      // TODO: audit - reservation.create

      return reservation;
    });

    // enqueue expiration job and let the worker persist ReservationTTLJob
    try {
      await enqueueReservationExpiration(r.id, expiresAt);
    } catch (e) {
      console.warn("reservation: failed to enqueue expiration job", e);
    }

    return r;
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * getReservation
 */
export async function getReservation(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: { lead: true, unit: true, listing: true },
  });
}

/**
 * listReservations
 */
export async function listReservations(filter: any = {}) {
  const where: any = {};
  if (filter.userId) where.userId = filter.userId;
  if (filter.status) where.status = filter.status;
  return prisma.reservation.findMany({ where, orderBy: { createdAt: "desc" } });
}

/**
 * updateReservation (partial)
 */
export async function updateReservation(id: string, data: any) {
  // minimal wrapper - careful with state changes; use specific endpoints for business operations
  return prisma.reservation.update({ where: { id }, data });
}

/**
 * cancelReservation
 * - sets CANCELLED, frees unit/listing
 * - only ACTIVE reservations can be cancelled
 * - if a TTL job exists, attempt to remove it (under lock)
 */
export async function cancelReservation(id: string, cancelledBy?: string) {
  // We'll acquire lock on the reservation's unit/listing resource to avoid races with TTL job
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r) throw new Error("reservation not found");

  const resourceLockKey = r.unitId
    ? `lock:unit:reserve:${r.unitId}`
    : `lock:listing:reserve:${r.listingId}`;
  const { acquiredLock, token } = await tryAcquireLock(
    resourceLockKey,
    LOCK_TTL
  );
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    // re-read inside lock
    const fresh = await prisma.reservation.findUnique({ where: { id } });
    if (!fresh) throw new Error("reservation not found");

    const status = String(fresh.status ?? "").toLowerCase();
    if (status !== "active") {
      throw new Error("Only active reservations can be cancelled.");
    }
    // Attempt to cancel TTL job if job id present in ReservationTTLJob table (under lock)
    try {
      await removeTtlJobIfExists(fresh.id);
    } catch (e) {
      // best-effort
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.reservation.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          meta: { ...(fresh.meta as any), cancelledBy },
        },
      });

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

      // TODO: audit - reservation.cancel
      return up;
    });

    return updated;
  } finally {
    await releaseLock(resourceLockKey, token);
  }
}

/**
 * cancelActiveReservationsForUnit
 * - Cancels all active reservations for a given unitId
 * - Marks reservation.status = "CANCELLED", cancelledAt, meta.reason
 * - Removes TTL job if present
 * - Returns count of cancelled reservations
 */
export async function cancelActiveReservationsForUnit(
  unitId: string,
  reason: string = "inventory.sold",
  actor?: string
) {
  const lockKey = `lock:unit:reserve:${unitId}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    const active = await prisma.reservation.findMany({
      where: {
        unitId,
        OR: [{ status: ReservationStatus.ACTIVE }],
      },
    });

    for (const r of active) {
      try {
        await removeTtlJobIfExists(r.id);
      } catch (e) {
        // best-effort
      }

      await prisma.reservation.update({
        where: { id: r.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          meta: {
            ...(r.meta as any),
            cancelledReason: reason,
            cancelledBy: actor ?? null,
          },
        },
      });

      // TODO: emit notifications about cancellation if needed
    }

    return active.length;
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * cancelActiveReservationsForListing
 * - Cancels all active reservations for a given listingId
 * - Marks reservation.status = "CANCELLED", cancelledAt, meta.reason
 * - Removes TTL job if present
 * - Returns count of cancelled reservations
 */
export async function cancelActiveReservationsForListing(
  listingId: string,
  reason: string = "inventory.closed",
  actor?: string
) {
  const lockKey = `lock:listing:reserve:${listingId}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    const active = await prisma.reservation.findMany({
      where: {
        listingId,
        OR: [{ status: ReservationStatus.ACTIVE }],
      },
    });

    for (const r of active) {
      try {
        await removeTtlJobIfExists(r.id);
      } catch (e) {
        // best-effort
      }

      await prisma.reservation.update({
        where: { id: r.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          meta: {
            ...(r.meta as any),
            cancelledReason: reason,
            cancelledBy: actor ?? null,
          },
        },
      });

      // TODO: emit notifications about cancellation if needed
    }

    return active.length;
  } finally {
    await releaseLock(lockKey, token);
  }
}
