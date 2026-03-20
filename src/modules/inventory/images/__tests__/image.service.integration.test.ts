// src/modules/inventory/images/__tests__/image.service.integration.test.ts
import { describe, it, expect } from "@jest/globals";
import { prisma } from "@/db/db.js";
import {
  addImagesToListing,
  addImagesToUnit,
  removeListingImage,
  reorderListingImages,
} from "../image.service.js";

describe("Inventory Image Service (integration)", () => {
  it("adds images to listing with correct positions", async () => {
    const listing = await prisma.listing.create({
      data: {
        title: "Listing 1",
        type: "SALE",
      },
    });

    const images = await addImagesToListing(listing.id, [
      { url: "a.jpg" },
      { url: "b.jpg" },
    ]);

    expect(images).toHaveLength(2);

    const [img1, img2] = images;
    if (!img1 || !img2) throw new Error("Expected 2 images");

    expect((img1.meta as any).position).toBe(0);
    expect((img2.meta as any).position).toBe(1);
  });

  it("adds images to unit", async () => {
    const project = await prisma.project.create({
      data: { name: "Test Project" },
    });

    const unit = await prisma.unit.create({
      data: {
        projectId: project.id,
        unitNumber: "101",
      },
    });

    const images = await addImagesToUnit(unit.id, [{ url: "u.jpg" }]);

    expect(images).toHaveLength(1);

    const img = images[0];
    if (!img) throw new Error("Expected unit image");

    expect(img.unitId).toBe(unit.id);
    expect((img.meta as any).position).toBe(0);
  });

  it("reorders listing images", async () => {
    const listing = await prisma.listing.create({
      data: {
        title: "Listing 3",
        type: "SALE",
      },
    });

    const images = await addImagesToListing(listing.id, [
      { url: "1.jpg" },
      { url: "2.jpg" },
      { url: "3.jpg" },
    ]);

    expect(images).toHaveLength(3);

    const [img0, img1, img2] = images;
    if (!img0 || !img1 || !img2) throw new Error("Expected 3 images");

    const order = [img2.id, img0.id, img1.id];

    await reorderListingImages(listing.id, order);

    // ✅ Fetch normally (no JSON orderBy)
    const rows = await prisma.listingImage.findMany({
      where: { listingId: listing.id },
    });

    // ✅ Sort in JS (Prisma-safe)
    const sorted = rows.sort(
      (a, b) =>
        ((a.meta as any)?.position ?? 0) - ((b.meta as any)?.position ?? 0)
    );

    expect(sorted.map((i) => i.id)).toEqual(order);
  });

  it("removes listing image", async () => {
    const listing = await prisma.listing.create({
      data: {
        title: "Listing 4",
        type: "SALE",
      },
    });

    const images = await addImagesToListing(listing.id, [{ url: "x.jpg" }]);
    expect(images).toHaveLength(1);

    const img = images[0];
    if (!img) throw new Error("Expected image");

    await removeListingImage(img.id);

    const found = await prisma.listingImage.findUnique({
      where: { id: img.id },
    });

    expect(found).toBeNull();
  });

  it("rejects invalid reorder ids", async () => {
    const listing = await prisma.listing.create({
      data: {
        title: "Listing 5",
        type: "SALE",
      },
    });

    await addImagesToListing(listing.id, [{ url: "a.jpg" }]);

    await expect(
      reorderListingImages(listing.id, ["invalid-id"])
    ).rejects.toThrow("invalid image ids");
  });
});
