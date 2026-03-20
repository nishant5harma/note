import { Router, raw } from "express";
import { verifyHmacMiddleware } from "@/middlewares/hmac.middleware.js";
import { webhookHandler } from "./intake.controller.js";

export const IntakeRouter: Router = Router();
/**
 * Use raw body so we can compute HMAC over exact bytes.
 * Accept any content-type; you may limit to application/json if desired.
 */
IntakeRouter.post(
  "/",
  raw({ type: "*/*", limit: "1mb" }),
  verifyHmacMiddleware, // reads req.rawBody and verifies signature
  webhookHandler
);
export default IntakeRouter;
