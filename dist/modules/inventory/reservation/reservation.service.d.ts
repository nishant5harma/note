/**
 * createReservation:
 * - Acquire resource lock (unit or listing)
 * - validate business rules (no double-block, status checks)
 * - create Reservation row
 * - mark Unit (or Listing) as BLOCKED / UNDER_OFFER
 * - enqueue expiration job (worker will mark expired and register TTL row)
 */
export declare function createReservation(data: any): Promise<{
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
}>;
/**
 * getReservation
 */
export declare function getReservation(id: string): Promise<({
    lead: {
        id: string;
        createdAt: Date;
        name: string | null;
        email: string | null;
        phone: string | null;
        updatedAt: Date;
        assignedAt: Date | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        status: import("@prisma/client").$Enums.LeadStatus;
        source: string | null;
        priority: import("@prisma/client").$Enums.LeadPriority;
        externalId: string | null;
        dedupeHash: string | null;
        stage: import("@prisma/client").$Enums.LeadStage;
        assignedToId: string | null;
        assignedTeamId: string | null;
    } | null;
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
    } | null;
    listing: {
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
    } | null;
} & {
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
}) | null>;
/**
 * listReservations
 */
export declare function listReservations(filter?: any): Promise<{
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
}[]>;
/**
 * updateReservation (partial)
 */
export declare function updateReservation(id: string, data: any): Promise<{
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
}>;
/**
 * cancelReservation
 * - sets CANCELLED, frees unit/listing
 * - only ACTIVE reservations can be cancelled
 * - if a TTL job exists, attempt to remove it (under lock)
 */
export declare function cancelReservation(id: string, cancelledBy?: string): Promise<{
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
}>;
/**
 * cancelActiveReservationsForUnit
 * - Cancels all active reservations for a given unitId
 * - Marks reservation.status = "CANCELLED", cancelledAt, meta.reason
 * - Removes TTL job if present
 * - Returns count of cancelled reservations
 */
export declare function cancelActiveReservationsForUnit(unitId: string, reason?: string, actor?: string): Promise<number>;
/**
 * cancelActiveReservationsForListing
 * - Cancels all active reservations for a given listingId
 * - Marks reservation.status = "CANCELLED", cancelledAt, meta.reason
 * - Removes TTL job if present
 * - Returns count of cancelled reservations
 */
export declare function cancelActiveReservationsForListing(listingId: string, reason?: string, actor?: string): Promise<number>;
//# sourceMappingURL=reservation.service.d.ts.map