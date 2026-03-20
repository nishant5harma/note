import { z } from "zod";

export const normalizeSource = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

export const sourceKeySchema = z
  .string()
  .min(1)
  .transform((s) => normalizeSource(s))
  .refine((s) => s.length > 0, "source is required");

export const sourcePoolCreateSchema = z.object({
  source: sourceKeySchema,
  teamId: z.string().min(1).nullable().optional(),
  strategy: z.string().min(1).nullable().optional(),
  active: z.boolean().optional(),
  meta: z.any().optional(),
});

export const sourcePoolUpdateSchema = z.object({
  teamId: z.string().min(1).nullable().optional(),
  strategy: z.string().min(1).nullable().optional(),
  active: z.boolean().optional(),
  meta: z.any().optional(),
});

export const listSourcePoolsQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

