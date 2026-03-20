// /src/modules/hr/consent/consent.service.ts
import { prisma } from "@/db/db.js";
import { NotFoundError } from "@/utils/http-errors.util.js";

/**
 * Record a consent entry (user grants consent)
 */
export async function createConsent(params: {
  userId: string;
  type: "LOCATION" | "PHOTO" | "TERMS";
  version?: string | null;
  meta?: any;
}) {
  const { userId, type, version, meta } = params;
  // create consent record
  const c = await prisma.consent.create({
    data: {
      userId,
      type,
      version: version ?? null,
      meta: meta ?? null,
    },
  });
  return c;
}

/**
 * Revoke consent (set revokedAt)
 */
export async function revokeConsent(params: {
  userId: string;
  id?: string;
  type?: "LOCATION" | "PHOTO" | "TERMS";
}) {
  // If id provided, revoke that row; else revoke latest consent of given type
  if (params.id) {
    const row = await prisma.consent.update({
      where: { id: params.id },
      data: { revokedAt: new Date() },
    });
    return row;
  }
  if (!params.type) throw new Error("id or type required");
  const row = await prisma.consent.findFirst({
    where: { userId: params.userId, type: params.type, revokedAt: null },
    orderBy: { grantedAt: "desc" },
  });
  if (!row) throw new NotFoundError("consent not found");
  const updated = await prisma.consent.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return updated;
}

/**
 * List consents for a user
 */
export async function listConsents(userId: string) {
  return prisma.consent.findMany({
    where: { userId },
    orderBy: { grantedAt: "desc" },
  });
}
