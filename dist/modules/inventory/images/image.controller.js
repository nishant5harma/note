import { addImagesToListing, addImagesToUnit, removeListingImage, removeUnitImage, reorderListingImages, reorderUnitImages, } from "./image.service.js";
import { prisma } from "../../../db/db.js";
import { reorderSchema } from "./validator/image.validator.js";
export async function uploadImagesToListingHandler(req, res, next) {
    try {
        const listingId = String(req.params.id);
        const actorId = req.user?.id ?? "system";
        const images = Array.isArray(req.fileUrls)
            ? req.fileUrls
            : [];
        const created = await addImagesToListing(listingId, images, actorId);
        res.json({ ok: true, data: created });
    }
    catch (err) {
        next(err);
    }
}
export async function uploadImagesToUnitHandler(req, res, next) {
    try {
        const unitId = String(req.params.id);
        const actorId = req.user?.id ?? "system";
        const images = Array.isArray(req.fileUrls)
            ? req.fileUrls
            : [];
        const created = await addImagesToUnit(unitId, images, actorId);
        res.json({ ok: true, data: created });
    }
    catch (err) {
        next(err);
    }
}
export async function listListingImagesHandler(req, res, next) {
    try {
        const listingId = String(req.params.id);
        const items = await prisma.listingImage.findMany({
            where: { listingId },
            orderBy: { createdAt: "asc" },
        });
        // ✅ Safe JS-side ordering
        const sorted = items.sort((a, b) => {
            const pa = a.meta?.position ?? 0;
            const pb = b.meta?.position ?? 0;
            return pa - pb;
        });
        res.json({ ok: true, items: sorted });
    }
    catch (err) {
        next(err);
    }
}
export async function listUnitImagesHandler(req, res, next) {
    try {
        const unitId = String(req.params.id);
        const items = await prisma.unitImage.findMany({
            where: { unitId },
            orderBy: { createdAt: "asc" },
        });
        const sorted = items.sort((a, b) => {
            const pa = a.meta?.position ?? 0;
            const pb = b.meta?.position ?? 0;
            return pa - pb;
        });
        res.json({ ok: true, items: sorted });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteListingImageHandler(req, res, next) {
    try {
        const imageId = String(req.params.imageId);
        await removeListingImage(imageId);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
export async function deleteUnitImageHandler(req, res, next) {
    try {
        const imageId = String(req.params.imageId);
        await removeUnitImage(imageId);
        res.json({ ok: true });
    }
    catch (err) {
        next(err);
    }
}
export async function reorderListingImagesHandler(req, res, next) {
    try {
        const parsed = reorderSchema.parse(req.body);
        const listingId = String(req.params.id);
        const updated = await reorderListingImages(listingId, parsed.order);
        res.json({ ok: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
export async function reorderUnitImagesHandler(req, res, next) {
    try {
        const parsed = reorderSchema.parse(req.body);
        const unitId = String(req.params.id);
        const updated = await reorderUnitImages(unitId, parsed.order);
        res.json({ ok: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=image.controller.js.map