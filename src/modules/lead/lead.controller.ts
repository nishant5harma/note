import type { NextFunction, Response } from "express";
import { z } from "zod";
import type { AuthRequest } from "@/types/auth-request.js";
import { BadRequestError } from "@/utils/http-errors.util.js";
import { LeadService } from "./lead.service.js";
import { listLeadsQuerySchema } from "./lead.validator.js";

export const LeadController = {
  listLeadsHandler,
  getLeadByIdHandler,
};

export default LeadController;

async function listLeadsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Express' req.query types include string|string[]; Zod handles coercion
    const query = listLeadsQuerySchema.parse(req.query as any);
    const result = await LeadService.listLeads(query);
    return res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: z.treeifyError(err) });
    }
    next(err);
  }
}

async function getLeadByIdHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = String((req.params as any).id || "");
    if (!id) throw new BadRequestError("Lead ID is required");
    const result = await LeadService.getLeadById(id);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

