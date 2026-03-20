import { Factory } from "fishery";
export declare const locationRequestFactory: Factory<{
    id: string;
    expiresAt: Date;
    createdAt: Date;
    requesterId: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    note: string | null;
    respondedBy: string | null;
    targetId: string;
    fulfilledAt: Date | null;
}, any, {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    requesterId: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    note: string | null;
    respondedBy: string | null;
    targetId: string;
    fulfilledAt: Date | null;
}, import("fishery").DeepPartialObject<{
    id: string;
    expiresAt: Date;
    createdAt: Date;
    requesterId: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    note: string | null;
    respondedBy: string | null;
    targetId: string;
    fulfilledAt: Date | null;
}>>;
//# sourceMappingURL=location-request.factory.d.ts.map