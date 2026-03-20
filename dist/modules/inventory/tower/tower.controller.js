// /src/modules/inventory/tower/tower.controller.ts
import { createTower, getTower, listTowersByProject, updateTower, deleteTower, } from "./tower.service.js";
import { createTowerSchema, updateTowerSchema, } from "./validator/tower.validator.js";
export async function createTowerHandler(req, res, next) {
    try {
        const dto = createTowerSchema.parse(req.body);
        const t = await createTower(dto);
        res.json({ ok: true, data: t });
    }
    catch (err) {
        next(err);
    }
}
export async function getTowerHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const t = await getTower(id);
        if (!t)
            return res.status(404).json({ ok: false, error: "not found" });
        res.json({ ok: true, data: t });
    }
    catch (err) {
        next(err);
    }
}
export async function listTowersHandler(req, res, next) {
    try {
        const projectId = req.query.projectId
            ? String(req.query.projectId)
            : undefined;
        const items = await listTowersByProject(projectId);
        res.json({ ok: true, items });
    }
    catch (err) {
        next(err);
    }
}
export async function updateTowerHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        const dto = updateTowerSchema.parse(req.body);
        const t = await updateTower(id, dto);
        res.json({ ok: true, data: t });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteTowerHandler(req, res, next) {
    try {
        const id = String(req.params.id);
        await deleteTower(id);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=tower.controller.js.map