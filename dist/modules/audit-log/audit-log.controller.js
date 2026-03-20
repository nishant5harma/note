import { BadRequestError, NotFoundError } from "../../utils/http-errors.util.js";
import { toStringSafe } from "../../utils/fix.js";
import { listAuditLogsQuerySchema } from "./audit-log.validator.js";
import { getAuditLogById, listAuditLogs } from "./audit-log.service.js";
export async function listAuditLogsHandler(req, res, next) {
    try {
        const q = listAuditLogsQuerySchema.parse(req.query);
        const r = await listAuditLogs(q);
        return res.json({ ok: true, ...r });
    }
    catch (err) {
        next(err);
    }
}
export async function getAuditLogByIdHandler(req, res, next) {
    try {
        const id = toStringSafe(req.params.id);
        if (!id)
            throw new BadRequestError("id is required");
        const row = await getAuditLogById(id);
        if (!row)
            throw new NotFoundError("AuditLog not found");
        return res.json({ ok: true, data: row });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=audit-log.controller.js.map