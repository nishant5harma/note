// /src/modules/cold-call/agent/pull.service.ts
import { prisma } from "@/db/db.js";

/**
 * Claim the next available ColdCallEntry for the user.
 *
 * Uses Postgres row-level locking via a raw SELECT ... FOR UPDATE SKIP LOCKED
 * inside a transaction to avoid races.
 *
 * Returns the claimed entry (after setting lockUserId, lockExpiresAt, status).
 *
 * NOTE: We build a safe SQL using parameter replacement for teamIds array.
 */
export async function claimNextColdCallEntry(
  userId: string,
  teamIds: string[],
  lockMs = 2 * 60_000
) {
  if (!teamIds || teamIds.length === 0) return null;

  // Start a transaction
  return await prisma.$transaction(async (tx) => {
    // 1) find candidate id with SKIP LOCKED. Use parameterized array.
    // Prisma supports embedding JS arrays directly in a tagged template.
    // This is Postgres-specific syntax: assigned_team_id = ANY($1::text[])
    // However with prisma.$queryRaw we interpolate the teamIds array.
    // prettier-ignore
    const raw = await tx.$queryRaw<Array<{ id: string }>>`
       SELECT id
       FROM "ColdCallEntry"
       WHERE status = 'pending'
         AND "assignedTeamId" = ANY(${teamIds}::text[])
         AND (
           "lockExpiresAt" IS NULL
           OR "lockExpiresAt" < now()
         )
       ORDER BY priority DESC, "createdAt" ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1;
    `;

    const row = (raw as any[])[0];
    if (!row || !row.id) return null;

    const entryId = row.id;

    // 2) update entry to claim it and set lock + status
    const lockExpiresAt = new Date(Date.now() + lockMs);

    const updated = await tx.coldCallEntry.update({
      where: { id: entryId },
      data: {
        lockUserId: userId,
        lockExpiresAt,
        status: "in_progress",
      },
    });

    return updated;
  });
}

/**
 * Refresh lock TTL for an entry (only owner allowed).
 */
export async function refreshLock(
  entryId: string,
  userId: string,
  addMs = 2 * 60_000
) {
  // Only extend if current lockUserId === userId and lock not expired (or expired recently)
  const entry = await prisma.coldCallEntry.findUnique({
    where: { id: entryId },
  });
  if (!entry) throw new Error("entry-not-found");
  if (entry.lockUserId !== userId) throw new Error("not-lock-owner");

  const newExpiry = new Date(Date.now() + addMs);
  const updated = await prisma.coldCallEntry.update({
    where: { id: entryId },
    data: { lockExpiresAt: newExpiry, status: "in_progress" },
  });
  return updated;
}

/**
 * Release lock (clear lockUserId and lockExpiresAt).
 * Optionally set status -> pending (unless forceDone === true).
 */
export async function releaseLock(
  entryId: string,
  userId: string,
  makePending = true
) {
  return await prisma.$transaction(async (tx) => {
    const entry = await tx.coldCallEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new Error("entry-not-found");

    // allow release if owner or if lock expired or if userId is 'system' (admin action)
    const isOwner = entry.lockUserId === userId;
    const lockExpired =
      !entry.lockExpiresAt || new Date(entry.lockExpiresAt) < new Date();
    if (!isOwner && !lockExpired && userId !== "system") {
      throw new Error("cannot-release-lock");
    }

    const data: any = { lockUserId: null, lockExpiresAt: null };
    if (makePending) data.status = "pending";

    const updated = await tx.coldCallEntry.update({
      where: { id: entryId },
      data,
    });

    return updated;
  });
}
