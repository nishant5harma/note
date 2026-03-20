// /src/modules/cold-call/upload/upload.controller.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import { uploadColdCallService } from "./upload.service.js";

// Use memory storage to pass buffer directly to parser
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(
      process.env.COLDCALL_MAX_UPLOAD_BYTES ?? String(20 * 1024 * 1024),
      10
    ),
  },
});

/**
 * POST /api/coldcall/upload
 * - file: multipart file
 * - mode: manual|decorator
 * - dedupePolicy: keep|skip
 * - teamIds: optional JSON array string or multiple form fields named teamIds
 * - routingConfig: optional JSON string
 */
export const uploadColdCallHandler: RequestHandler[] = [
  // multer middleware
  upload.single("file"),

  // handler function
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user?.id ?? "system";
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ ok: false, error: "file (xlsx/csv) is required" });
      }

      // Basic mimetype check: warn if not typical Excel/CSV
      const mimetype = file.mimetype || "";
      const allowed = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "text/csv",
        "text/plain",
        "application/csv",
      ];
      let warning: string | null = null;
      if (!allowed.includes(mimetype)) {
        // don't block — warn the uploader and continue parsing; many clients set different mimetypes
        warning =
          "Warning: uploaded file has an unexpected mimetype (" +
          mimetype +
          "). Parser will attempt to process it, but verify results.";
      }

      // parse simple fields from body
      const mode = String(req.body.mode ?? "manual");
      const dedupePolicy = String(req.body.dedupePolicy ?? "keep");

      let teamIds: string[] | null = null;
      if (req.body.teamIds) {
        try {
          teamIds = Array.isArray(req.body.teamIds)
            ? req.body.teamIds
            : JSON.parse(String(req.body.teamIds));
        } catch {
          teamIds = String(req.body.teamIds)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      let routingConfig: any = null;
      if (req.body.routingConfig) {
        try {
          routingConfig = JSON.parse(String(req.body.routingConfig));
        } catch {
          routingConfig = null;
        }
      }

      const result = await uploadColdCallService({
        fileBuffer: file.buffer,
        originalName: file.originalname ?? null,
        uploadedById: actorId,
        dedupePolicy: dedupePolicy as "keep" | "skip",
        mode: mode as "manual" | "decorator",
        teamIds,
        routingConfig,
      });

      // attach warning if present
      if (warning) (result as any).warning = warning;

      return res.status(201).json({ ok: true, data: result });
    } catch (err) {
      next(err);
    }
  },
];
