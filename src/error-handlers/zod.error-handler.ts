// src/error-handlers/zod.error-handler.ts
import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export function zodErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: z.treeifyError(err),
    });
  }

  // Not a Zod error? Pass it to the next handler (the Global Error Handler)
  next(err);
}
