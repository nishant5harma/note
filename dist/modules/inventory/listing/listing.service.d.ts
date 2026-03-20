import type { ListingFilter } from "./types/listing-filter.type.js";
export declare function createListing(data: any): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import("@prisma/client").$Enums.ListingType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ListingStatus;
    city: string | null;
    locality: string | null;
    projectId: string | null;
    unitId: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: bigint | null;
    title: string;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    sqft: number | null;
}>;
export declare function getListing(id: string): Promise<{
    project: {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        active: boolean;
        developer: string | null;
        city: string | null;
        locality: string | null;
        address: string | null;
    };
    unit: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.UnitStatus;
        projectId: string;
        towerId: string | null;
        floor: number | null;
        unitNumber: string | null;
        sizeSqFt: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        facing: string | null;
        price: bigint | null;
    };
    reservations: {
        id: string;
        expiresAt: Date;
        createdAt: Date;
        userId: string | null;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        note: string | null;
        leadId: string | null;
        unitId: string | null;
        listingId: string | null;
        reservedAt: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
    }[];
    images: {
        id: string;
        createdAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        url: string;
        listingId: string;
        alt: string | null;
    }[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import("@prisma/client").$Enums.ListingType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ListingStatus;
    city: string | null;
    locality: string | null;
    projectId: string | null;
    unitId: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: bigint | null;
    title: string;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    sqft: number | null;
}>;
/**
 * filter options:
 * - page, limit
 * - city, locality
 * - priceMin, priceMax
 * - bedrooms, bathrooms
 * - sqftMin, sqftMax
 * - projectId, unitId, status, type
 * - q (search text, matches title and ownerName and locality)
 * - sort (price_asc, price_desc, created_desc, created_asc)
 */
export declare function listListings(filter?: ListingFilter): Promise<{
    items: ({
        project: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            active: boolean;
            developer: string | null;
            city: string | null;
            locality: string | null;
            address: string | null;
        };
        unit: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.UnitStatus;
            projectId: string;
            towerId: string | null;
            floor: number | null;
            unitNumber: string | null;
            sizeSqFt: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            facing: string | null;
            price: bigint | null;
        };
        images: {
            id: string;
            createdAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            url: string;
            listingId: string;
            alt: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.ListingType;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.ListingStatus;
        city: string | null;
        locality: string | null;
        projectId: string | null;
        unitId: string | null;
        bedrooms: number | null;
        bathrooms: number | null;
        price: bigint | null;
        title: string;
        ownerName: string | null;
        ownerPhone: string | null;
        ownerEmail: string | null;
        sqft: number | null;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}>;
/**
 * updateListing:
 * - Acquire a lock to prevent concurrent modifications
 * - Prevent updates to sold/closed listings unless force=true
 */
export declare function updateListing(id: string, data: any, opts?: {
    force?: boolean;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import("@prisma/client").$Enums.ListingType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ListingStatus;
    city: string | null;
    locality: string | null;
    projectId: string | null;
    unitId: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: bigint | null;
    title: string;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    sqft: number | null;
}>;
/**
 * closeListing:
 * - Acquire a lock to prevent concurrent modifications
 * - Cancel all active reservations for this listing (using helper function)
 * - Mark listing as CLOSED
 * - If listing references a unit, call sellUnit (best-effort) after transaction
 */
export declare function closeListing(listingId: string, payload?: {
    closedBy?: string;
    note?: string;
}): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import("@prisma/client").$Enums.ListingType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ListingStatus;
    city: string | null;
    locality: string | null;
    projectId: string | null;
    unitId: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: bigint | null;
    title: string;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    sqft: number | null;
}>;
/**
 * deleteListing:
 * - Acquire a lock to prevent concurrent deletion/modification
 */
export declare function deleteListing(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import("@prisma/client").$Enums.ListingType;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    status: import("@prisma/client").$Enums.ListingStatus;
    city: string | null;
    locality: string | null;
    projectId: string | null;
    unitId: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: bigint | null;
    title: string;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    sqft: number | null;
}>;
//# sourceMappingURL=listing.service.d.ts.map