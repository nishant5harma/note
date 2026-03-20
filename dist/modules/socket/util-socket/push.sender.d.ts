/**
 * sendPushToUser:
 * Queries user devices and attempts delivery across all platforms (Socket, Web, Mobile).
 */
export declare function sendPushToUser(userId: string, payload: any): Promise<{
    devices: {
        deviceId: string;
        platform: string;
        ok: boolean;
        reason?: string;
    }[];
    count: number;
}>;
/**
 * sendLocationFetchSignal:
 * Specific signal used to request GPS from a mobile device.
 */
export declare function sendLocationFetchSignal(userId: string, requestId: string): Promise<{
    devices: {
        deviceId: string;
        platform: string;
        ok: boolean;
        reason?: string;
    }[];
    count: number;
}>;
//# sourceMappingURL=push.sender.d.ts.map