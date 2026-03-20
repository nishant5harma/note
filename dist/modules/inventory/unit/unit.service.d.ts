import type { UnitFilter } from "./types/unit-filter.type.js";
export declare function createUnit(data: any): Promise<{
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
}>;
export declare function getUnit(id: string): Promise<({
    tower: {
        id: string;
        createdAt: Date;
        name: string | null;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        floors: number | null;
        projectId: string;
    } | null;
    reservations: {
        id: string;
        expiresAt: Date;
        createdAt: Date;
        userId: string | null;
        updatedAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        leadId: string | null;
        status: import("@prisma/client").$Enums.ReservationStatus;
        note: string | null;
        unitId: string | null;
        listingId: string | null;
        reservedAt: Date;
        confirmedAt: Date | null;
        cancelledAt: Date | null;
    }[];
    listings: {
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
    }[];
    images: {
        id: string;
        createdAt: Date;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        url: string;
        unitId: string;
        alt: string | null;
    }[];
} & {
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
}) | null>;
export declare function listUnits(filter?: UnitFilter): Promise<{
    items: ({
        tower: {
            id: string;
            createdAt: Date;
            name: string | null;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            floors: number | null;
            projectId: string;
        } | null;
        reservations: {
            id: string;
            expiresAt: Date;
            createdAt: Date;
            userId: string | null;
            updatedAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            leadId: string | null;
            status: import("@prisma/client").$Enums.ReservationStatus;
            note: string | null;
            unitId: string | null;
            listingId: string | null;
            reservedAt: Date;
            confirmedAt: Date | null;
            cancelledAt: Date | null;
        }[];
        listings: {
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
        }[];
        images: {
            id: string;
            createdAt: Date;
            meta: import("@prisma/client/runtime/library").JsonValue | null;
            url: string;
            unitId: string;
            alt: string | null;
        }[];
    } & {
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
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}>;
/**
 * updateUnit:
 * - Acquire lock to prevent concurrent modifications
 * - Prevent updates to sold units unless force=true (admin override)
 */
export declare function updateUnit(id: string, data: any, opts?: {
    force?: boolean;
}): Promise<{
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
}>;
/**
 * sellUnit:
 * - Acquire lock on the unit to prevent concurrent reservations/sales
 * - Verify unit is not already sold
 * - Cancel all active reservations for the unit (update status and remove TTL jobs)
 * - Mark unit as SOLD and store metadata (soldBy, soldAt, note, price)
 * - Close all related listings by setting status=CLOSED
 */
export declare function sellUnit(unitId: string, payload?: {
    soldBy?: string;
    price?: number | bigint;
    note?: string;
}): Promise<{
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
}>;
/**
 * deleteUnit:
 * - Acquire lock to prevent deletion while unit is being modified/sold
 */
export declare function deleteUnit(id: string): Promise<{
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
}>;
//# sourceMappingURL=unit.service.d.ts.map