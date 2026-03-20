// /src/modules/hr/device/device.controller.ts
import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "@/types/auth-request.js";
import {
  deviceRegisterSchema,
  deviceUnregisterSchema,
} from "./validator/device.validator.js";
import {
  registerDevice,
  unregisterDevice,
  listDevicesForUser,
} from "./device.service.js";
import { z } from "zod";

/**
 * POST /api/devices/register
 */
export async function registerDeviceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = deviceRegisterSchema.parse(req.body);
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    const row = await registerDevice({
      userId: req.user.id,
      deviceId: data.deviceId ?? null,
      platform: data.platform ?? null,
      pushToken: data.pushToken ?? null,
      meta: data.meta,
    });
    return res.status(201).json({ device: row });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: z.treeifyError(err) });
    next(err);
  }
}

/**
 * POST /api/devices/unregister
 */
export async function unregisterDeviceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = deviceUnregisterSchema.parse(req.body);
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    const payload: { userId: string; deviceId?: string; pushToken?: string } = {
      userId: req.user.id,
    };
    if (data.deviceId !== undefined) payload.deviceId = data.deviceId;
    if (data.pushToken !== undefined) payload.pushToken = data.pushToken;
    await unregisterDevice(payload);
    return res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ error: z.treeifyError(err) });
    next(err);
  }
}

/**
 * GET /api/devices (list own devices)
 */
export async function listMyDevicesHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    const rows = await listDevicesForUser(req.user.id);
    return res.json({ devices: rows });
  } catch (err) {
    next(err);
  }
}
