// /src/modules/inventory/reservation/reservation.controller.ts

import type { Request, Response, NextFunction } from "express";
import {
  createReservation,
  getReservation,
  listReservations,
  updateReservation,
  cancelReservation,
} from "./reservation.service.js";
import {
  createReservationSchema,
  updateReservationSchema,
} from "./validator/reservation.validator.js";

export async function createReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dto = createReservationSchema.parse(req.body);
    const r = await createReservation(dto);
    res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}

export async function getReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    const r = await getReservation(id);
    if (!r) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, data: r });
  } catch (err) {
    next(err);
  }
}

export async function listReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filter: any = {};
    if (req.query.userId) filter.userId = String(req.query.userId);
    if (req.query.status) filter.status = String(req.query.status);
    const items = await listReservations(filter);
    res.json({ ok: true, items });
  } catch (err) {
    next(err);
  }
}

export async function updateReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    const dto = updateReservationSchema.parse(req.body);
    const updated = await updateReservation(id, dto);
    res.json({ ok: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function cancelReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    const cancelled = await cancelReservation(
      id,
      (req as any).user?.id ?? "system"
    );
    res.json({ ok: true, data: cancelled });
  } catch (err) {
    next(err);
  }
}
