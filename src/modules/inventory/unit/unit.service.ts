// /src/modules/inventory/unit/unit.service.ts

import { prisma } from "@/db/db.js";
import { ReservationStatus } from "@prisma/client";
import type { UnitFilter } from "./types/unit-filter.type.js";
import { tryAcquireLock, releaseLock } from "@/utils/redis.lock.js";
import { reservationExpirationQueue } from "../reservation/worker/reservation.worker.js";

const LOCK_TTL = 10_000;

/**
 * Helper to remove TTL job if it exists.
 * Now reads jobId from ReservationTTLJob table (single source of truth).
 */
async function removeTtlJobIfExists(jobIdOrReservationId?: string | null) {
  if (!jobIdOrReservationId) return;
  try {
    // treat argument as reservationId
    const rec = await prisma.reservationTTLJob.findUnique({
      where: { reservationId: jobIdOrReservationId },
    });
    if (!rec) return;

    const jobId = rec.jobId;
    try {
      const job = await reservationExpirationQueue.getJob(jobId);
      if (job) await job.remove();
    } catch (e) {
      console.warn("removeTtlJobIfExists failed to remove job from queue", e);
    }

    try {
      await prisma.reservationTTLJob.delete({
        where: { reservationId: jobIdOrReservationId },
      });
    } catch (e) {
      console.warn("removeTtlJobIfExists failed to delete DB record", e);
    }
  } catch (e) {
    console.warn("removeTtlJobIfExists failed", e);
  }
}

export async function createUnit(data: any) {
  return prisma.unit.create({ data });
}

export async function getUnit(id: string) {
  return prisma.unit.findUnique({
    where: { id },
    include: { images: true, reservations: true, listings: true, tower: true },
  });
}

export async function listUnits(filter: UnitFilter = {}) {
  const page =
    typeof filter.page === "number" &&
    Number.isFinite(filter.page) &&
    filter.page > 0
      ? filter.page
      : 1;

  const limit =
    typeof filter.limit === "number" &&
    Number.isFinite(filter.limit) &&
    filter.limit > 0
      ? Math.min(200, filter.limit)
      : 50;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (filter.projectId) where.projectId = filter.projectId;
  if (filter.towerId) where.towerId = filter.towerId;
  if (filter.status) where.status = filter.status;

  if (filter.bedrooms !== undefined) where.bedrooms = Number(filter.bedrooms);
  if (filter.bathrooms !== undefined)
    where.bathrooms = Number(filter.bathrooms);

  if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
    where.price = {};
    if (filter.priceMin !== undefined)
      where.price.gte = BigInt(filter.priceMin);
    if (filter.priceMax !== undefined)
      where.price.lte = BigInt(filter.priceMax);
  }

  if (filter.sizeMin !== undefined || filter.sizeMax !== undefined) {
    where.sizeSqFt = {};
    if (filter.sizeMin !== undefined)
      where.sizeSqFt.gte = Number(filter.sizeMin);
    if (filter.sizeMax !== undefined)
      where.sizeSqFt.lte = Number(filter.sizeMax);
  }

  if (filter.q) {
    const q = String(filter.q);
    where.OR = [
      { unitNumber: { contains: q, mode: "insensitive" } },
      { facing: { contains: q, mode: "insensitive" } },
    ];
  }

  // Multi-field sorting: price first (if applicable), then createdAt
  let orderBy: any[] = [{ createdAt: "desc" }];

  if (filter.sort) {
    switch (filter.sort) {
      case "price_asc":
        orderBy = [{ price: "asc" }, { createdAt: "desc" }];
        break;
      case "price_desc":
        orderBy = [{ price: "desc" }, { createdAt: "desc" }];
        break;
      case "created_asc":
        orderBy = [{ createdAt: "asc" }];
        break;
      case "created_desc":
      default:
        orderBy = [{ createdAt: "desc" }];
    }
  }

  const [items, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        images: true,
        reservations: true,
        listings: true,
        tower: true,
      },
    }),
    prisma.unit.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
}

/**
 * updateUnit:
 * - Acquire lock to prevent concurrent modifications
 * - Prevent updates to sold units unless force=true (admin override)
 */
export async function updateUnit(
  id: string,
  data: any,
  opts?: { force?: boolean }
) {
  const lockKey = `lock:unit:reserve:${id}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new Error("unit not found");

    const status = String(unit.status ?? "available").toUpperCase();
    if (status === "SOLD" && !(opts?.force ?? false)) {
      throw new Error("Cannot modify unit: already SOLD");
    }

    return prisma.unit.update({ where: { id }, data });
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * sellUnit:
 * - Acquire lock on the unit to prevent concurrent reservations/sales
 * - Verify unit is not already sold
 * - Cancel all active reservations for the unit (update status and remove TTL jobs)
 * - Mark unit as SOLD and store metadata (soldBy, soldAt, note, price)
 * - Close all related listings by setting status=CLOSED
 */
export async function sellUnit(
  unitId: string,
  payload?: { soldBy?: string; price?: number | bigint; note?: string }
) {
  const lockKey = `lock:unit:reserve:${unitId}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    return prisma.$transaction(async (tx) => {
      const unit = await tx.unit.findUnique({
        where: { id: unitId },
        include: { listings: true },
      });
      if (!unit) throw new Error("unit not found");

      const status = String(unit.status ?? "available").toUpperCase();
      if (status === "SOLD") throw new Error("unit already sold");

      // Cancel reservations referring to this unit (inside tx updates)
      const reservations = await tx.reservation.findMany({
        where: { unitId, OR: [{ status: ReservationStatus.ACTIVE }] },
      });

      for (const r of reservations) {
        // Remove TTL job best-effort
        try {
          const meta = (r.meta as any) ?? {};
          const jobId = meta?.ttlJobId ?? null;
          await removeTtlJobIfExists(jobId);
        } catch (e) {
          console.warn(
            "sellUnit: failed to remove TTL job for reservation",
            r.id,
            e
          );
        }

        await tx.reservation.update({
          where: { id: r.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            meta: {
              ...(r.meta as any),
              cancelledReason: "unit.sold",
              cancelledBy: payload?.soldBy ?? null,
            },
          },
        });
      }

      // Update unit -> mark SOLD, record sold metadata
      const newMeta = {
        ...(unit.meta as any),
        soldBy: payload?.soldBy ?? null,
        soldAt: new Date().toISOString(),
        soldNote: payload?.note ?? null,
        soldPrice: payload?.price ?? null,
      };
      const updatedUnit = await tx.unit.update({
        where: { id: unitId },
        data: { status: "SOLD", meta: newMeta },
      });

      // Close related listings (if any)
      if (unit.listings && unit.listings.length > 0) {
        for (const lst of unit.listings) {
          await tx.listing.update({
            where: { id: lst.id },
            data: { status: "CLOSED", updatedAt: new Date() },
          });
        }
      }

      // TODO: add inventory audit: actor=payload?.soldBy action='sell' resource='unit'

      return updatedUnit;
    });
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * deleteUnit:
 * - Acquire lock to prevent deletion while unit is being modified/sold
 */
export async function deleteUnit(id: string) {
  const lockKey = `lock:unit:reserve:${id}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    return prisma.unit.delete({ where: { id } });
  } finally {
    await releaseLock(lockKey, token);
  }
}
