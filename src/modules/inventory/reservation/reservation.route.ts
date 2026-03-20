// /src/modules/inventory/reservation/reservation.route.ts

import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  createReservationHandler,
  getReservationHandler,
  listReservationsHandler,
  updateReservationHandler,
  cancelReservationHandler,
} from "./reservation.controller.js";

export const ReservationRouter: Router = Router();

ReservationRouter.get(
  "/",
  requirePermission("inventory", "read"),
  listReservationsHandler
);
ReservationRouter.post(
  "/",
  requirePermission("inventory", "write"),
  createReservationHandler
);
ReservationRouter.get(
  "/:id",
  requirePermission("inventory", "read"),
  getReservationHandler
);
ReservationRouter.patch(
  "/:id",
  requirePermission("inventory", "write"),
  updateReservationHandler
);
ReservationRouter.post(
  "/:id/cancel",
  requirePermission("inventory", "write"),
  cancelReservationHandler
);

export default ReservationRouter;
