import { Factory } from "fishery";
export declare const reservationFactory: Factory<{
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
}, any, {
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
}, import("fishery").DeepPartialObject<{
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
}>>;
//# sourceMappingURL=reservation.factory.d.ts.map