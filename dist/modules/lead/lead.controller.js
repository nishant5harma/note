import { z } from "zod";
import { BadRequestError } from "../../utils/http-errors.util.js";
import { LeadService } from "./lead.service.js";
import { listLeadsQuerySchema } from "./lead.validator.js";
export const LeadController = {
    listLeadsHandler,
    getLeadByIdHandler,
};
export default LeadController;
async function listLeadsHandler(req, res, next) {
    try {
        // Express' req.query types include string|string[]; Zod handles coercion
        const query = listLeadsQuerySchema.parse(req.query);
        const result = await LeadService.listLeads(query);
        return res.json(result);
    }
    catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: z.treeifyError(err) });
        }
        next(err);
    }
}
async function getLeadByIdHandler(req, res, next) {
    try {
        const id = String(req.params.id || "");
        if (!id)
            throw new BadRequestError("Lead ID is required");
        const result = await LeadService.getLeadById(id);
        return res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=lead.controller.js.map