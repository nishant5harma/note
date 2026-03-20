// /src/modules/inventory/listing/listing.route.ts

import { Router } from "express";
import { requirePermission } from "@/middlewares/require-premission.middleware.js";
import { uploadMulti } from "@/middlewares/upload.middleware.js";
import {
  createListingHandler,
  getListingHandler,
  listListingsHandler,
  updateListingHandler,
  deleteListingHandler,
  closeListingHandler,
} from "./listing.controller.js";
import {
  deleteListingImageHandler,
  listListingImagesHandler,
  reorderListingImagesHandler,
  uploadImagesToListingHandler,
} from "../images/image.controller.js";

export const ListingRouter: Router = Router();

ListingRouter.get(
  "/",
  requirePermission("inventory", "read"),
  listListingsHandler
);

ListingRouter.post(
  "/",
  requirePermission("inventory", "write"),
  createListingHandler
);

ListingRouter.get(
  "/:id",
  requirePermission("inventory", "read"),
  getListingHandler
);

ListingRouter.put(
  "/:id",
  requirePermission("inventory", "write"),
  updateListingHandler
);

ListingRouter.post(
  "/:id/close",
  requirePermission("inventory", "manage"),
  closeListingHandler
);

ListingRouter.delete(
  "/:id",
  requirePermission("inventory", "delete"),
  deleteListingHandler
);

// Listing images
ListingRouter.post(
  "/:id/images",
  requirePermission("inventory", "write"),
  uploadMulti("images"),
  uploadImagesToListingHandler
);
ListingRouter.get(
  "/:id/images",
  requirePermission("inventory", "read"),
  listListingImagesHandler
);
ListingRouter.delete(
  "/images/:imageId",
  requirePermission("inventory", "delete"),
  deleteListingImageHandler
);
ListingRouter.post(
  "/:id/images/reorder",
  requirePermission("inventory", "write"),
  reorderListingImagesHandler
);

export default ListingRouter;
