// /src/modules/hr/device/device.service.ts
import { prisma } from "@/db/db.js";
import { NotFoundError, BadRequestError } from "@/utils/http-errors.util.js";

/**
 * Register a device (create or update)
 */
export async function registerDevice(params: {
  userId: string;
  deviceId?: string | null;
  platform?: string | null;
  pushToken?: string | null;
  meta?: any;
}) {
  const { userId, deviceId, platform, pushToken, meta } = params;

  // prefer matching by deviceId if provided; else by pushToken; else create new
  if (deviceId) {
    const existing = await prisma.device.findFirst({
      where: { deviceId, userId },
    });
    if (existing) {
      const updated = await prisma.device.update({
        where: { id: existing.id },
        data: {
          platform: platform ?? existing.platform,
          pushToken: pushToken ?? existing.pushToken,
          lastSeenAt: new Date(),
          meta: meta ?? existing.meta,
        },
      });
      return updated;
    }
  }

  if (pushToken) {
    const existingByToken = await prisma.device.findFirst({
      where: { pushToken, userId },
    });
    if (existingByToken) {
      const updated = await prisma.device.update({
        where: { id: existingByToken.id },
        data: {
          deviceId: deviceId ?? existingByToken.deviceId,
          platform: platform ?? existingByToken.platform,
          lastSeenAt: new Date(),
          meta: meta ?? existingByToken.meta,
        },
      });
      return updated;
    }
  }

  // create new device row
  const created = await prisma.device.create({
    data: {
      userId,
      deviceId: deviceId ?? null,
      platform: platform ?? null,
      pushToken: pushToken ?? null,
      lastSeenAt: new Date(),
      meta: meta ?? null,
    },
  });
  return created;
}

/**
 * Unregister device by deviceId or pushToken
 */
export async function unregisterDevice(params: {
  userId: string;
  deviceId?: string;
  pushToken?: string;
}) {
  const { userId, deviceId, pushToken } = params;
  if (!deviceId && !pushToken)
    throw new BadRequestError("deviceId or pushToken required");
  const whereClause: any = { userId };
  if (deviceId) whereClause.deviceId = deviceId;
  if (pushToken) whereClause.pushToken = pushToken;

  const dev = await prisma.device.findFirst({ where: whereClause });
  if (!dev) throw new NotFoundError("Device not found");

  await prisma.device.delete({ where: { id: dev.id } });
  return true;
}

/**
 * list devices for a user
 */
export async function listDevicesForUser(userId: string) {
  return prisma.device.findMany({ where: { userId } });
}
