export declare function addImagesToListing(listingId: string, urlsOrObjs: Array<string | {
    url: string;
    storageKey?: string;
}>, actorId?: string): Promise<{
    id: string;
    createdAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    url: string;
    listingId: string;
    alt: string | null;
}[]>;
export declare function addImagesToUnit(unitId: string, urlsOrObjs: Array<string | {
    url: string;
    storageKey?: string;
}>, actorId?: string): Promise<{
    id: string;
    createdAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    url: string;
    unitId: string;
    alt: string | null;
}[]>;
export declare function removeListingImage(imageId: string): Promise<boolean>;
export declare function removeUnitImage(imageId: string): Promise<boolean>;
export declare function reorderListingImages(listingId: string, order: string[]): Promise<{
    id: string;
    createdAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    url: string;
    listingId: string;
    alt: string | null;
}[]>;
export declare function reorderUnitImages(unitId: string, order: string[]): Promise<{
    id: string;
    createdAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    url: string;
    unitId: string;
    alt: string | null;
}[]>;
//# sourceMappingURL=image.service.d.ts.map