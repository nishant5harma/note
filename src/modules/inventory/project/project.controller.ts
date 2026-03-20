// /src/modules/inventory/project/project.controller.ts

import type { Request, Response, NextFunction } from "express";
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
} from "./project.service.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "./validator/project.validator.js";
import { BadRequestError } from "@/utils/http-errors.util.js";
import { toStringSafe } from "@/utils/fix.js";

export async function createProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dto = createProjectSchema.parse(req.body);
    const project = await createProject(dto);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function listProjectsHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projects = await listProjects();
    res.json({ items: projects });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dto = updateProjectSchema.parse(req.body);
    const id = toStringSafe(req.params.id);
    if (!id) throw new BadRequestError();
    const project = await updateProject(id, dto);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = toStringSafe(req.params.id);
    if (!id) throw new BadRequestError();
    const project = await deleteProject(id);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}
