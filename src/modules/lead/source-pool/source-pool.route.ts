import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import {
  deleteSourcePoolHandler,
  listSourcePoolsHandler,
  listUnmappedSourcesHandler,
  updateSourcePoolHandler,
  upsertSourcePoolHandler,
} from "./source-pool.controller.js";

export const SourcePoolRouter: Router = Router();

// All SourcePool management is admin-like: protect with auth + lead.assign permission
SourcePoolRouter.use(requireAuth, requirePermission("lead", "assign"));

// list mappings
SourcePoolRouter.get("/", listSourcePoolsHandler);

// list sources present in leads but unmapped (or mapped to null team)
SourcePoolRouter.get("/unmapped-sources", listUnmappedSourcesHandler);

// create or replace mapping (upsert by source)
SourcePoolRouter.post("/", upsertSourcePoolHandler);

// patch mapping by source key
SourcePoolRouter.patch("/:source", updateSourcePoolHandler);

// delete mapping by source key
SourcePoolRouter.delete("/:source", deleteSourcePoolHandler);

export default SourcePoolRouter;

