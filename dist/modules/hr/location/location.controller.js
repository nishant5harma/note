import { asString } from "../../../utils/param.util.js";
import { locationRequestCreateSchema, locationRequestRespondSchema, } from "./validator/location.validator.js";
import { LocationService } from "./location.service.js";
import { BadRequestError } from "../../../utils/http-errors.util.js";
import { z } from "zod";
// src/modules/hr/location/location.controller.ts
// Exports LocationController object
export const LocationController = {
    createLocationRequestHandler,
    getLocationRequestResultHandler,
    respondLocationRequestHandler,
};
export default LocationController;
// Controller Function Implementations
/** helper to format & return Zod errors */
function handleZodError(err, res) {
    if (err instanceof z.ZodError) {
        return res.status(400).json({ error: z.treeifyError(err) });
    }
    return null;
}
/**
 * POST /api/hr/location-requests
 */
async function createLocationRequestHandler(req, res, next) {
    try {
        const data = locationRequestCreateSchema.parse(req.body);
        if (!req.user)
            throw new BadRequestError("user missing in request");
        const reqRow = await LocationService.createLocationRequest(req.user, data.targetUserId, data.expiresInSeconds, data.note);
        return res
            .status(201)
            .json({ requestId: reqRow.id, expiresAt: reqRow.expiresAt });
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
/**
 * POST /api/hr/location-requests/:id/respond
 */
async function respondLocationRequestHandler(req, res, next) {
    try {
        const id = asString(req.params.id);
        if (!id)
            throw new BadRequestError("request id required");
        const data = locationRequestRespondSchema.parse(req.body);
        if (!req.user)
            throw new BadRequestError("user missing in request");
        await LocationService.respondToLocationRequest(req.user, id, data);
        return res.json({ ok: true });
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
/**
 * GET /api/hr/location-requests/:id/result
 */
async function getLocationRequestResultHandler(req, res, next) {
    try {
        const id = asString(req.params.id);
        if (!id)
            throw new BadRequestError("request id required");
        if (!req.user)
            throw new BadRequestError("user missing in request");
        const result = await LocationService.getLocationRequestResult(req.user, id);
        if (!result)
            return res.status(404).json({ status: "not_found" });
        return res.json({ coords: result });
    }
    catch (err) {
        if (err instanceof z.ZodError)
            return handleZodError(err, res);
        next(err);
    }
}
//# sourceMappingURL=location.controller.js.map