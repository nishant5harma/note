/**
 * Register a device (create or update)
 */
export declare function registerDevice(params: {
    userId: string;
    deviceId?: string | null;
    platform?: string | null;
    pushToken?: string | null;
    meta?: any;
}): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    platform: string | null;
    deviceId: string | null;
    pushToken: string | null;
    lastSeenAt: Date | null;
}>;
/**
 * Unregister device by deviceId or pushToken
 */
export declare function unregisterDevice(params: {
    userId: string;
    deviceId?: string;
    pushToken?: string;
}): Promise<boolean>;
/**
 * list devices for a user
 */
export declare function listDevicesForUser(userId: string): Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    updatedAt: Date;
    meta: import("@prisma/client/runtime/library").JsonValue | null;
    platform: string | null;
    deviceId: string | null;
    pushToken: string | null;
    lastSeenAt: Date | null;
}[]>;
//# sourceMappingURL=device.service.d.ts.map