// /src/modules/inventory/unit/unit.route.ts
import { Router } from "express";
import { requirePermission } from "../../../middlewares/require-premission.middleware.js";
import { createUnitHandler, getUnitHandler, listUnitsHandler, updateUnitHandler, deleteUnitHandler, sellUnitHandler, } from "./unit.controller.js";
import { uploadMulti } from "../../../middlewares/upload.middleware.js";
import { deleteUnitImageHandler, listUnitImagesHandler, reorderUnitImagesHandler, uploadImagesToUnitHandler, } from "../images/image.controller.js";
export const UnitRouter = Router();
UnitRouter.get("/", requirePermission("inventory", "read"), listUnitsHandler);
UnitRouter.post("/", requirePermission("inventory", "write"), createUnitHandler);
UnitRouter.get("/:id", requirePermission("inventory", "read"), getUnitHandler);
UnitRouter.put("/:id", requirePermission("inventory", "write"), updateUnitHandler);
UnitRouter.delete("/:id", requirePermission("inventory", "delete"), deleteUnitHandler);
UnitRouter.post("/:id/sell", requirePermission("inventory", "manage"), sellUnitHandler);
// Unit images
UnitRouter.post("/:id/images", requirePermission("inventory", "write"), uploadMulti("images"), uploadImagesToUnitHandler);
UnitRouter.get("/:id/images", requirePermission("inventory", "read"), listUnitImagesHandler);
UnitRouter.delete("/images/:imageId", requirePermission("inventory", "delete"), deleteUnitImageHandler);
UnitRouter.post("/:id/images/reorder", requirePermission("inventory", "write"), reorderUnitImagesHandler);
export default UnitRouter;
//# sourceMappingURL=unit.route.js.map