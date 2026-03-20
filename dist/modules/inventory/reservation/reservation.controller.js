// /src/modules/inventory/reservation/reservation.controller.ts
import { createReservation, getReservation, listReservations, updateReservation, cancelReservation, } from "./reservation.service.js";
import { createReservationSchema, updateReservationSchema, } from "./validator/reservation.validator.js";
export async function createReservationHandler(req, res, next) {
    try {
        const dto = createReservationSchema.parse(req.body);
        const r = await createReservation(dto);
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
export async function getReservationHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const r = await getReservation(id);
        if (!r)
            return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true, data: r });
    }
    catch (err) {
        next(err);
    }
}
export async function listReservationsHandler(req, res, next) {
    try {
        const filter = {};
        if (req.query.userId)
            filter.userId = String(req.query.userId);
        if (req.query.status)
            filter.status = String(req.query.status);
        const items = await listReservations(filter);
        res.json({ ok: true, items });
    }
    catch (err) {
        next(err);
    }
}
export async function updateReservationHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const dto = updateReservationSchema.parse(req.body);
        const updated = await updateReservation(id, dto);
        res.json({ ok: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
export async function cancelReservationHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const cancelled = await cancelReservation(id, req.user?.id ?? "system");
        res.json({ ok: true, data: cancelled });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reservation.controller.js.map