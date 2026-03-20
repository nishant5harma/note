// /src/modules/inventory/unit/validator/unit.validator.ts

import { z } from "zod";

export const createUnitSchema = z.object({
  projectId: z.string().min(1),
  towerId: z.string().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  unitNumber: z.string().nullable().optional(),
  sizeSqFt: z.number().nullable().optional(),
  bedrooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  facing: z.string().nullable().optional(),
  price: z.union([z.number(), z.bigint()]).nullable().optional(),
  status: z.string().optional(),
  meta: z.any().optional(),
});

export const updateUnitSchema = createUnitSchema.partial();
