// /src/modules/inventory/listing/listing.service.ts

import { prisma } from "@/db/db.js";
import { sellUnit } from "../unit/unit.service.js";
import { ReservationStatus } from "@prisma/client";
import { omitUndefined } from "@/utils/omit-undefined.util.js";
import type { ListingFilter } from "./types/listing-filter.type.js";
import { tryAcquireLock, releaseLock } from "@/utils/redis.lock.js";
import { cancelActiveReservationsForListing } from "../reservation/reservation.service.js";

const LOCK_TTL = 10_000;

export async function createListing(data: any) {
  return prisma.listing.create({ data });
}

export async function getListing(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { images: true, project: true, unit: true, reservations: true },
  });
}

/**
 * filter options:
 * - page, limit
 * - city, locality
 * - priceMin, priceMax
 * - bedrooms, bathrooms
 * - sqftMin, sqftMax
 * - projectId, unitId, status, type
 * - q (search text, matches title and ownerName and locality)
 * - sort (price_asc, price_desc, created_desc, created_asc)
 */
export async function listListings(filter: ListingFilter = {}) {
  const page = Math.max(1, Number(filter.page ?? 1));
  const limit = Math.min(200, Number(filter.limit ?? 50));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filter.projectId) where.projectId = filter.projectId;
  if (filter.unitId) where.unitId = filter.unitId;
  if (filter.status) where.status = filter.status;
  if (filter.type) where.type = filter.type;
  if (filter.city) where.city = { equals: filter.city, mode: "insensitive" };
  if (filter.locality)
    where.locality = { contains: filter.locality, mode: "insensitive" };

  if (filter.priceMin || filter.priceMax) {
    where.price = {};
    if (filter.priceMin !== undefined)
      where.price.gte = BigInt(filter.priceMin);
    if (filter.priceMax !== undefined)
      where.price.lte = BigInt(filter.priceMax);
  }

  if (filter.sqftMin || filter.sqftMax) {
    where.sqft = {};
    if (filter.sqftMin !== undefined) where.sqft.gte = Number(filter.sqftMin);
    if (filter.sqftMax !== undefined) where.sqft.lte = Number(filter.sqftMax);
  }

  if (filter.bedrooms !== undefined) where.bedrooms = Number(filter.bedrooms);
  if (filter.bathrooms !== undefined)
    where.bathrooms = Number(filter.bathrooms);

  if (filter.q) {
    const q = String(filter.q);
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
      { locality: { contains: q, mode: "insensitive" } },
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
    prisma.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { images: true, project: true, unit: true },
    }),
    prisma.listing.count({ where }),
  ]);

  return { items, meta: { page, limit, total } };
}

/**
 * updateListing:
 * - Acquire a lock to prevent concurrent modifications
 * - Prevent updates to sold/closed listings unless force=true
 */
export async function updateListing(
  id: string,
  data: any,
  opts?: { force?: boolean }
) {
  const lockKey = `lock:listing:modify:${id}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new Error("listing not found");

    const status = String(listing.status ?? "available").toUpperCase();
    if ((status === "CLOSED" || status === "SOLD") && !(opts?.force ?? false)) {
      throw new Error("Cannot modify listing: already closed/sold");
    }

    return prisma.listing.update({ where: { id }, data });
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * closeListing:
 * - Acquire a lock to prevent concurrent modifications
 * - Cancel all active reservations for this listing (using helper function)
 * - Mark listing as CLOSED
 * - If listing references a unit, call sellUnit (best-effort) after transaction
 */
export async function closeListing(
  listingId: string,
  payload?: { closedBy?: string; note?: string }
) {
  const lockKey = `lock:listing:reserve:${listingId}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new Error("listing not found");

    // If listing already closed/sold -> no-op
    const status = String(listing.status ?? "available").toUpperCase();
    if (status === "CLOSED" || status === "SOLD") {
      throw new Error("Listing already closed or sold");
    }

    return prisma
      .$transaction(async (tx) => {
        // Cancel active reservations for listing (helper handles TTL job removal)
        await cancelActiveReservationsForListing(
          listingId,
          "listing.closed",
          payload?.closedBy
        );

        // Mark listing as CLOSED
        await tx.listing.update({
          where: { id: listingId },
          data: { status: "CLOSED", updatedAt: new Date() },
        });

        // TODO: inventory audit - listing.closed

        return tx.listing.findUnique({ where: { id: listingId } });
      })
      .then(async (res) => {
        // If listing references a unit -> finalize unit sale (best-effort)
        if (listing.unitId) {
          try {
            const saleDto = omitUndefined({
              soldBy: payload?.closedBy,
              note: payload?.note,
              price: listing.price ?? undefined,
            });

            await sellUnit(listing.unitId, saleDto);
          } catch (e) {
            console.warn("closeListing: sellUnit failed (best-effort)", e);
          }
        }
        return res;
      });
  } finally {
    await releaseLock(lockKey, token);
  }
}

/**
 * deleteListing:
 * - Acquire a lock to prevent concurrent deletion/modification
 */
export async function deleteListing(id: string) {
  const lockKey = `lock:listing:modify:${id}`;
  const { acquiredLock, token } = await tryAcquireLock(lockKey, LOCK_TTL);
  if (!acquiredLock || !token) {
    throw new Error("Resource busy. Please retry.");
  }

  try {
    return prisma.listing.delete({ where: { id } });
  } finally {
    await releaseLock(lockKey, token);
  }
}
