// /src/modules/inventory/images/image.service.ts
import { prisma } from "../../../db/db.js";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? "";
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET ?? "";
const supabase = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
const isLocal = process.env.NODE_ENV === "local";
/**
 * Helper: remove storage object (best-effort)
 */
async function removeStorageObject(storageKey) {
    if (!storageKey)
        return;
    try {
        if (isLocal) {
            const filePath = path.join(process.cwd(), "uploads", storageKey);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        else if (supabase) {
            // storageKey is the key used when uploading
            await supabase.storage.from(SUPABASE_BUCKET).remove([storageKey]);
        }
    }
    catch (e) {
        console.warn("removeStorageObject failed", e);
    }
}
export async function addImagesToListing(listingId, urlsOrObjs, actorId) {
    // Insert images with meta.position in ascending order (append)
    const existing = await prisma.listingImage.findMany({
        where: { listingId },
        orderBy: { createdAt: "asc" },
    });
    const startPos = existing.length;
    const created = [];
    for (let i = 0; i < urlsOrObjs.length; i++) {
        const item = urlsOrObjs[i];
        if (!item)
            throw new Error("item cannot be empty");
        const url = typeof item === "string" ? item : item.url;
        const storageKey = typeof item === "string" ? undefined : item.storageKey;
        if (!url)
            throw new Error("url cannot be empty");
        const img = await prisma.listingImage.create({
            data: {
                listingId,
                url,
                meta: { position: startPos + i, storageKey },
            },
        });
        created.push(img);
    }
    // TODO: inventory audit
    return created;
}
export async function addImagesToUnit(unitId, urlsOrObjs, actorId) {
    const existing = await prisma.unitImage.findMany({
        where: { unitId },
        orderBy: { createdAt: "asc" },
    });
    const startPos = existing.length;
    const created = [];
    for (let i = 0; i < urlsOrObjs.length; i++) {
        const item = urlsOrObjs[i];
        if (!item)
            throw new Error("item cannot be empty");
        const url = typeof item === "string" ? item : item.url;
        const storageKey = typeof item === "string" ? undefined : item.storageKey;
        if (!url)
            throw new Error("url cannot be empty");
        const img = await prisma.unitImage.create({
            data: {
                unitId,
                url,
                meta: { position: startPos + i, storageKey },
            },
        });
        created.push(img);
    }
    // TODO: inventory audit
    return created;
}
export async function removeListingImage(imageId) {
    const img = await prisma.listingImage.findUnique({ where: { id: imageId } });
    if (!img)
        throw new Error("image not found");
    const meta = img.meta ?? {};
    const storageKey = meta?.storageKey ?? null;
    // Delete DB row first (transaction could be used but storage removal is external)
    await prisma.listingImage.delete({ where: { id: imageId } });
    // remove from storage best-effort
    await removeStorageObject(storageKey);
    // TODO: inventory audit
    return true;
}
export async function removeUnitImage(imageId) {
    const img = await prisma.unitImage.findUnique({ where: { id: imageId } });
    if (!img)
        throw new Error("image not found");
    const meta = img.meta ?? {};
    const storageKey = meta?.storageKey ?? null;
    await prisma.unitImage.delete({ where: { id: imageId } });
    await removeStorageObject(storageKey);
    // TODO: inventory audit
    return true;
}
export async function reorderListingImages(listingId, order) {
    // Validate images belong to listing
    const imgs = await prisma.listingImage.findMany({
        where: { listingId, id: { in: order } },
    });
    if (imgs.length !== order.length)
        throw new Error("invalid image ids");
    // update positions
    const tx = await prisma.$transaction(order.map((id, idx) => prisma.listingImage.update({
        where: { id },
        data: { meta: { position: idx } },
    })));
    // TODO: audit
    return tx;
}
export async function reorderUnitImages(unitId, order) {
    const imgs = await prisma.unitImage.findMany({
        where: { unitId, id: { in: order } },
    });
    if (imgs.length !== order.length)
        throw new Error("invalid image ids");
    const tx = await prisma.$transaction(order.map((id, idx) => prisma.unitImage.update({
        where: { id },
        data: { meta: { position: idx } },
    })));
    // TODO: audit
    return tx;
}
//# sourceMappingURL=image.service.js.map