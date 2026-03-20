import { Factory } from "fishery";
export declare const reservationFactory: Factory<{
    id: string;
    status: import("@prisma/client").$Enums.ReservationStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    note: string | null;
    unitId: string | null;
    leadId: string | null;
    listingId: string | null;
    userId: string | null;
    expiresAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    updatedAt: Date;
    reservedAt: Date;
}, any, {
    id: string;
    status: import("@prisma/client").$Enums.ReservationStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    note: string | null;
    unitId: string | null;
    leadId: string | null;
    listingId: string | null;
    userId: string | null;
    expiresAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    updatedAt: Date;
    reservedAt: Date;
}, import("fishery").DeepPartialObject<{
    id: string;
    status: import("@prisma/client").$Enums.ReservationStatus;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    createdAt: Date;
    note: string | null;
    unitId: string | null;
    leadId: string | null;
    listingId: string | null;
    userId: string | null;
    expiresAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
    updatedAt: Date;
    reservedAt: Date;
}>>;
//# sourceMappingURL=reservation.factory.d.ts.map