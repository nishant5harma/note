import type { AuthUser } from "../../../types/auth-request.js";
import type { RespondLocationInput } from "./types/location.types.js";
export declare const LocationService: {
    createLocationRequest: typeof createLocationRequest;
    respondToLocationRequest: typeof respondToLocationRequest;
    getLocationRequestResult: typeof getLocationRequestResult;
};
export default LocationService;
declare function createLocationRequest(actor: AuthUser, targetUserId: string, expiresInSeconds?: number | undefined, note?: string | undefined): Promise<{
    id: string;
    expiresAt: Date;
    createdAt: Date;
    requesterId: string;
    status: import("@prisma/client").$Enums.LocationRequestStatus;
    note: string | null;
    respondedBy: string | null;
    targetId: string;
    fulfilledAt: Date | null;
}>;
declare function respondToLocationRequest(actor: AuthUser, requestId: string, payload: RespondLocationInput): Promise<{
    ok: boolean;
}>;
declare function getLocationRequestResult(actor: AuthUser, requestId: string): Promise<any>;
//# sourceMappingURL=location.service.d.ts.map