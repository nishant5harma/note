import { z } from "zod";

// src/modules/hr/location/validator/location.validator.ts
export const locationRequestCreateSchema = z.object({
  targetUserId: z.string(),
  expiresInSeconds: z.number().min(5).optional(), // default configurable
  note: z.string().optional(),
});

export const locationRequestRespondSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  recordedAt: z.string().optional(),
});
