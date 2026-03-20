import { Factory } from "fishery";
export declare const locationRequestFactory: Factory<{
    id: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    createdAt: Date;
    note: string | null;
    expiresAt: Date;
    requesterId: string;
    targetId: string;
    fulfilledAt: Date | null;
    respondedBy: string | null;
}, any, {
    id: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    createdAt: Date;
    note: string | null;
    expiresAt: Date;
    requesterId: string;
    targetId: string;
    fulfilledAt: Date | null;
    respondedBy: string | null;
}, import("fishery").DeepPartialObject<{
    id: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    createdAt: Date;
    note: string | null;
    expiresAt: Date;
    requesterId: string;
    targetId: string;
    fulfilledAt: Date | null;
    respondedBy: string | null;
}>>;
//# sourceMappingURL=location-request.factory.d.ts.map