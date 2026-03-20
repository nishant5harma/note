import { prisma } from "@/db/db.js";
import { BadRequestError, NotFoundError } from "@/utils/http-errors.util.js";
import { logAudit } from "@/utils/audit.util.js";
import type { AuthUser } from "@/types/auth-request.js";
import type {
  AttendanceListFilter,
  CheckinInput,
} from "./types/attendance.types.js";

// src/modules/hr/attendance/attendance.service.ts

// Exported HrService object
export const AttendanceService = {
  createCheckin,
  listAttendance,
  checkout,
};

export default AttendanceService;

// Service Function Implementations

/* --- Helpers --- */
function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
function parseDateIfStr(v?: string | Date | null): Date | null {
  if (!v) return null;
  return v instanceof Date ? v : new Date(v);
}
async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");
  return user;
}

/* ---------- Attendance service ---------- */

async function createCheckin(actor: AuthUser, payload: CheckinInput) {
  // ensure user exists
  await ensureUserExists(actor.id);

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  // Prevent multiple check-ins per day
  const existing = await prisma.attendance.findFirst({
    where: {
      userId: actor.id,
      checkinAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });
  if (existing) {
    throw new BadRequestError("You’ve already checked in today.");
  }

  // Normalize incoming values for DB (convert undefined -> null, parse dates)
  const photoRef = payload.photoRef ?? null;
  const latitude = payload.latitude ?? null;
  const longitude = payload.longitude ?? null;
  const accuracy = payload.accuracy ?? null;
  const locationTsDate = payload.locationTs
    ? new Date(payload.locationTs)
    : null;
  const note = payload.note ?? null;

  // Use a transaction to create attendance, optional locationLog, and audit in one atomic step
  const attendance = await prisma.$transaction(async (tx) => {
    const created = await tx.attendance.create({
      data: {
        userId: actor.id,
        status: "ACCEPTED",
        checkinAt: now,
        photoRef,
        latitude,
        longitude,
        accuracy,
        locationTs: locationTsDate,
        note,
      },
    });

    if (payload.latitude !== undefined && payload.longitude !== undefined) {
      await tx.locationLog.create({
        data: {
          userId: actor.id,
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy ?? null,
          recordedAt: payload.locationTs ? new Date(payload.locationTs) : now,
          source: "attendance",
        },
      });
    }

    await tx.locationAccessAudit.create({
      data: {
        actorId: actor.id,
        targetId: actor.id,
        action: "checkin_created",
        meta: {
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
        },
      },
    });

    return created;
  });

  // Higher-level audit helper (non-transactional; useful for app-level logs)
  await logAudit({
    userId: actor.id,
    action: "checkin",
    resource: "attendance",
    resourceId: attendance.id,
    payload: { latitude: attendance.latitude, longitude: attendance.longitude },
  });

  return attendance;
}

/* ---------- List attendance with filters ---------- */

async function listAttendance(filter: AttendanceListFilter) {
  const where: any = {};

  if (filter.userId) where.userId = filter.userId;

  if (filter.teamId) {
    where.user = {
      teamMembers: {
        some: { teamId: filter.teamId },
      },
    };
  }

  if (filter.from || filter.to) {
    where.checkinAt = {};
    if (filter.from) where.checkinAt.gte = new Date(filter.from);
    if (filter.to) where.checkinAt.lte = new Date(filter.to);
  }

  const page = Math.max(1, filter.page ?? 1);
  const limit = Math.max(1, filter.limit ?? 100);

  const [rows, count] = await Promise.all([
    prisma.attendance.findMany({
      where,
      orderBy: { checkinAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          include: {
            teamMembers: { include: { team: true } },
          },
        },
      },
    }),
    prisma.attendance.count({ where }),
  ]);

  return { count, rows };
}

/* ---------- Checkout ---------- */

async function checkout(actor: AuthUser) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  // Find today's attendance
  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: actor.id,
      checkinAt: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  if (!attendance) {
    throw new BadRequestError("You haven’t checked in today.");
  }

  if (attendance.checkoutAt) {
    throw new BadRequestError("You’ve already checked out today.");
  }

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: { checkoutAt: now },
  });

  await logAudit({
    userId: actor.id,
    action: "checkout",
    resource: "attendance",
    resourceId: attendance.id,
  });

  return updated;
}
