import { z } from "zod";

function optionalNumberFromQuery() {
  return z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    if (Array.isArray(v)) v = v[0];
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }, z.number().optional());
}

function optionalDateFromQuery() {
  return z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return undefined;
    if (Array.isArray(v)) v = v[0];
    const d = new Date(String(v));
    return Number.isFinite(d.getTime()) ? d : v;
  }, z.date().optional());
}

export const listAuditLogsQuerySchema = z.object({
  page: optionalNumberFromQuery().pipe(z.number().int().min(1)).optional().default(1),
  limit: optionalNumberFromQuery()
    .pipe(z.number().int().min(1).max(200))
    .optional()
    .default(50),

  userId: z.string().min(1).optional(),
  roleName: z.string().min(1).optional(),
  action: z.string().min(1).optional(), // exact match
  actionPrefix: z.string().min(1).optional(), // e.g. "lead."
  resource: z.string().min(1).optional(), // exact match
  resourceId: z.string().min(1).optional(),

  from: optionalDateFromQuery().optional(),
  to: optionalDateFromQuery().optional(),

  q: z.string().min(1).optional(), // searches action/resource/resourceId (best-effort)
});

