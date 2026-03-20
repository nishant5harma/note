// src/modules/hr/attendance/attendance.routes.ts
import { Router } from "express";
import { AttendanceController } from "./attendance.controller.js";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import { requireAuth } from "@/middlewares/auth.middleware.js";

export const AttendanceRouter: Router = Router();

// Attendance
// Checkin: authenticated + permission to perform own attendance
AttendanceRouter.post(
  "/checkin",
  requireAuth,
  requirePermission("attendance", "self"),
  AttendanceController.attendanceCheckinHandler
);

// Checkout: authenticated + permission to perform own attendance
AttendanceRouter.post(
  "/checkout",
  requireAuth,
  requirePermission("attendance", "self"),
  AttendanceController.attendanceCheckoutHandler
);

// List (admin/manager): requires read permission
AttendanceRouter.get(
  "/",
  requireAuth,
  requirePermission("attendance", "read"),
  AttendanceController.attendanceListHandler
);

// Calendar endpoint can be added similarly: GET /attendance/calendar

export default AttendanceRouter;
