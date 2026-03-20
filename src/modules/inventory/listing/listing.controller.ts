// /src/modules/inventory/listing/listing.controller.ts
import type { Request, Response, NextFunction } from "express";
import {
  createListing,
  getListing,
  listListings,
  updateListing,
  deleteListing,
  closeListing,
} from "./listing.service.js";
import {
  createListingSchema,
  updateListingSchema,
} from "./validator/listing.validator.js";
import type { ListingFilter } from "./types/listing-filter.type.js";
import { parseNumber } from "@/utils/parse-number.util.js";

export async function createListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const dto = createListingSchema.parse(req.body);
    const l = await createListing(dto);
    res.json({ ok: true, data: l });
  } catch (err) {
    next(err);
  }
}

export async function getListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    const l = await getListing(id);
    if (!l) return res.status(404).json({ ok: false, error: "not found" });
    res.json({ ok: true, data: l });
  } catch (err) {
    next(err);
  }
}

export async function listListingsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filter: ListingFilter = {
      page: parseNumber(req.query.page),
      limit: parseNumber(req.query.limit),
      city: typeof req.query.city === "string" ? req.query.city : undefined,
      locality:
        typeof req.query.locality === "string" ? req.query.locality : undefined,
      priceMin: parseNumber(req.query.priceMin),
      priceMax: parseNumber(req.query.priceMax),
      bedrooms: parseNumber(req.query.bedrooms),
      bathrooms: parseNumber(req.query.bathrooms),
      sqftMin: parseNumber(req.query.sqftMin),
      sqftMax: parseNumber(req.query.sqftMax),
      projectId:
        typeof req.query.projectId === "string"
          ? req.query.projectId
          : undefined,
      unitId:
        typeof req.query.unitId === "string" ? req.query.unitId : undefined,
      status:
        typeof req.query.status === "string" ? req.query.status : undefined,
      type: typeof req.query.type === "string" ? req.query.type : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      sort:
        typeof req.query.sort === "string"
          ? (req.query.sort as ListingFilter["sort"])
          : undefined,
    };

    const result = await listListings(filter);
    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function updateListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    const dto = updateListingSchema.parse(req.body);
    const l = await updateListing(id, dto);
    res.json({ ok: true, data: l });
  } catch (err) {
    next(err);
  }
}

export async function closeListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const listingId = String(req.params.id);
    const actorId = (req as any).user?.id ?? "system";
    const { note } = req.body ?? {};
    const l = await closeListing(listingId, {
      closedBy: actorId,
      note: note ?? null,
    });
    res.json({ ok: true, data: l });
  } catch (err) {
    next(err);
  }
}

export async function deleteListingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);
    await deleteListing(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
