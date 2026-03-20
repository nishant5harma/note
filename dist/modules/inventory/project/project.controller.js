// /src/modules/inventory/project/project.controller.ts
import { asString } from "../../../utils/param.util.js";
import { createProject, listProjects, updateProject, deleteProject, } from "./project.service.js";
import { createProjectSchema, updateProjectSchema, } from "./validator/project.validator.js";
import { BadRequestError } from "../../../utils/http-errors.util.js";
export async function createProjectHandler(req, res, next) {
    try {
        const dto = createProjectSchema.parse(req.body);
        const project = await createProject(dto);
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
export async function listProjectsHandler(_req, res, next) {
    try {
        const projects = await listProjects();
        res.json({ items: projects });
    }
    catch (err) {
        next(err);
    }
}
export async function updateProjectHandler(req, res, next) {
    try {
        const dto = updateProjectSchema.parse(req.body);
        const id = asString(req.params.id);
        if (!id)
            throw new BadRequestError();
        const project = await updateProject(id, dto);
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteProjectHandler(req, res, next) {
    try {
        const id = asString(req.params.id);
        if (!id)
            throw new BadRequestError();
        const project = await deleteProject(id);
        res.json({ project });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=project.controller.js.map