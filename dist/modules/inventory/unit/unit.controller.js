// /src/modules/inventory/unit/unit.controller.ts
import { createUnit, getUnit, listUnits, updateUnit, deleteUnit, sellUnit, } from "./unit.service.js";
import { createUnitSchema, updateUnitSchema, } from "./validator/unit.validator.js";
import { parseNumber } from "../../../utils/parse-number.util.js";
export async function createUnitHandler(req, res, next) {
    try {
        const dto = createUnitSchema.parse(req.body);
        const u = await createUnit(dto);
        res.json({ ok: true, data: u });
    }
    catch (err) {
        next(err);
    }
}
export async function getUnitHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const u = await getUnit(id);
        if (!u)
            return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true, data: u });
    }
    catch (err) {
        next(err);
    }
}
export async function listUnitsHandler(req, res, next) {
    try {
        const filter = {
            page: parseNumber(req.query.page),
            limit: parseNumber(req.query.limit),
            projectId: typeof req.query.projectId === "string"
                ? req.query.projectId
                : undefined,
            towerId: typeof req.query.towerId === "string" ? req.query.towerId : undefined,
            status: typeof req.query.status === "string" ? req.query.status : undefined,
            bedrooms: parseNumber(req.query.bedrooms),
            bathrooms: parseNumber(req.query.bathrooms),
            priceMin: parseNumber(req.query.priceMin),
            priceMax: parseNumber(req.query.priceMax),
            sizeMin: parseNumber(req.query.sizeMin),
            sizeMax: parseNumber(req.query.sizeMax),
            q: typeof req.query.q === "string" ? req.query.q : undefined,
            sort: typeof req.query.sort === "string"
                ? req.query.sort
                : undefined,
        };
        const result = await listUnits(filter);
        res.json({ ok: true, ...result });
    }
    catch (err) {
        next(err);
    }
}
export async function updateUnitHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const dto = updateUnitSchema.parse(req.body);
        const u = await updateUnit(id, dto);
        res.json({ ok: true, data: u });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteUnitHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        await deleteUnit(id);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
export async function sellUnitHandler(req, res, next) {
    try {
        const unitId = String(req.params.id);
        const actorId = req.user?.id ?? "system";
        const { price, note } = req.body ?? {};
        const u = await sellUnit(unitId, {
            soldBy: actorId,
            price: price ?? null,
            note: note ?? null,
        });
        res.json({ ok: true, data: u });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=unit.controller.js.map