// src/modules/lead/validator/intake.validator.ts
import { z } from "zod";

export const webhookBaseSchema = z.object({
  source: z.string().optional(),
  externalId: z.string().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  payload: z.any().optional(),
});
